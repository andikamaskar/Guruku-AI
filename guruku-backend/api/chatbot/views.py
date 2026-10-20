from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .models import Conversation, ChatMessage
from .serializers import ConversationSerializer, ChatMessageSerializer
from .gemini_service import (
    ask_gemini,
    build_user_context,
    classify_question_scope,
)
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
        if not message:
            return Response({"error": "Message is required"}, status=400)

        try:
            convo = Conversation.objects.get(id=conversation_id, user=request.user)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=404)

        scope_category = classify_question_scope(message)
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

        # Ambil history chat sebelumnya (kecuali pesan barusan)
        previous_messages = ChatMessage.objects.filter(conversation=convo).exclude(id=user_msg.id).order_by('timestamp')
        history = []
        for msg in previous_messages:
            role = "user" if msg.role == "user" else "model"
            history.append({"role": role, "parts": [msg.content]})

        # Panggil Gemini API dengan history
        bot_answer = ask_gemini(
            message,
            history,
            user_context=build_user_context(request.user),
        )

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

