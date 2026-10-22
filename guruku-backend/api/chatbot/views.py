from django.conf import settings
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Conversation, ChatMessage
from .serializers import ConversationSerializer, ChatMessageSerializer
from .gemini_service import (
    CHATBOT_ERROR_MESSAGE,
    ask_gemini,
    build_user_context,
    classify_question_scope,
)
import logging

logger = logging.getLogger(__name__)
from .permissions import IsChatbotUser

OUT_OF_SCOPE_MESSAGE = (
    "Maaf, saya hanya dapat membantu topik pendidikan SMP/SMA, "
    "belajar, motivasi, manajemen waktu, dan persiapan ujian."
)
UNSAFE_MESSAGE = (
    "Maaf, saya tidak dapat membantu permintaan yang berbahaya, ilegal, "
    "atau melanggar etika."
)

ALLOWED_SCOPE_CATEGORIES = {"educational", "study_support", "ambiguous"}


def _rate_limit_key(user_id):
    return f"chatbot:message-rate:{user_id}"


def _consume_rate_limit(user_id):
    key = _rate_limit_key(user_id)
    current_count = cache.get(key, 0)
    if current_count >= settings.CHATBOT_RATE_LIMIT_COUNT:
        return False

    if current_count == 0:
        cache.set(key, 1, settings.CHATBOT_RATE_LIMIT_WINDOW)
    else:
        try:
            cache.incr(key)
        except ValueError:
            cache.set(key, 1, settings.CHATBOT_RATE_LIMIT_WINDOW)
    return True


def _build_history(conversation, current_message_id, context_message_ids=None):
    """Build bounded history from recent messages plus selected same-conversation messages."""
    recent_messages = list(
        ChatMessage.objects.filter(conversation=conversation)
        .exclude(id=current_message_id)
        .order_by("-timestamp")[:settings.CHATBOT_HISTORY_LIMIT]
    )

    selected_ids = context_message_ids or []
    if not isinstance(selected_ids, list):
        selected_ids = []
    selected_ids = selected_ids[:settings.CHATBOT_MAX_CONTEXT_MESSAGES]

    selected_messages = ChatMessage.objects.filter(
        conversation=conversation,
        id__in=selected_ids,
    )
    messages_by_id = {message.id: message for message in recent_messages}
    messages_by_id.update({message.id: message for message in selected_messages})

    messages = sorted(messages_by_id.values(), key=lambda message: message.timestamp)
    messages = messages[-settings.CHATBOT_MAX_CONTEXT_MESSAGES:]
    return [
        {
            "role": "user" if message.role == "user" else "model",
            "parts": [message.content],
        }
        for message in messages
    ]


class ConversationListCreateView(APIView):
    permission_classes = [IsChatbotUser]

    def get(self, request):
        conversations = Conversation.objects.filter(user=request.user).order_by("-created_at")
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)

    def post(self, request):
        title = request.data.get("title", "Percakapan Baru")
        convo = Conversation.objects.create(user=request.user, title=title)

        # Create welcome message
        welcome_text = f"Hallo, {request.user.full_name or 'User'}! Saya Guruku AI, siap membantu belajarmu. Tanyakan apa saja!"
        ChatMessage.objects.create(
            conversation=convo,
            role="bot",
            content=welcome_text
        )

        return Response({"conversation_id": convo.id}, status=status.HTTP_201_CREATED)


class ChatbotMessageView(APIView):
    permission_classes = [IsChatbotUser]

    def post(self, request, conversation_id):
        message = request.data.get("message")
        if not isinstance(message, str) or not message.strip():
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
        message = message.strip()
        if len(message) > settings.CHATBOT_MAX_MESSAGE_LENGTH:
            return Response(
                {"error": f"Message cannot exceed {settings.CHATBOT_MAX_MESSAGE_LENGTH} characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            convo = Conversation.objects.get(id=conversation_id, user=request.user)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        if not _consume_rate_limit(request.user.id):
            return Response(
                {"error": "Terlalu banyak pesan. Silakan coba lagi nanti."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        try:
            scope_category = classify_question_scope(message)
        except Exception:
            logger.exception("Chatbot scope classification failed")
            scope_category = "ambiguous"
        if scope_category == "unsafe":
            return Response({"error": UNSAFE_MESSAGE}, status=status.HTTP_400_BAD_REQUEST)
        if scope_category == "out_of_scope":
            return Response({"error": OUT_OF_SCOPE_MESSAGE}, status=status.HTTP_400_BAD_REQUEST)

        # Simpan pesan user
        user_msg = ChatMessage.objects.create(
            conversation=convo,
            role="user",
            content=message
        )

        context_message_ids = request.data.get("context_message_ids", [])
        history = _build_history(convo, user_msg.id, context_message_ids)

        # Panggil Gemini API dengan history
        try:
            bot_answer = ask_gemini(
                message,
                history,
                user_context=build_user_context(request.user),
            )
        except Exception:
            logger.exception("Chatbot tutor request failed")
            bot_answer = CHATBOT_ERROR_MESSAGE

        # Simpan jawaban bot
        bot_msg = ChatMessage.objects.create(
            conversation=convo,
            role="bot",
            content=bot_answer
        )

        return Response({
            "user_message": ChatMessageSerializer(user_msg).data,
            "bot_message": ChatMessageSerializer(bot_msg).data,
        }, status=200)


class ConversationDetailView(APIView):
    permission_classes = [IsChatbotUser]

    def get(self, request, conversation_id):
        try:
            convo = Conversation.objects.get(id=conversation_id, user=request.user)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=404)

        serializer = ConversationSerializer(convo)
        return Response(serializer.data)

