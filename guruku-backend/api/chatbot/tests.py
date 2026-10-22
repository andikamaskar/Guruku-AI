from django.conf import settings
from django.core.cache import cache
from django.test import SimpleTestCase, TestCase, override_settings
from rest_framework.test import APIRequestFactory, APITestCase
from rest_framework import status

from .views import _build_history

from api.users.models import User


from .permissions import IsChatbotUser
import json
import tempfile
from pathlib import Path
from unittest.mock import Mock, patch

from .gemini_service import (
    CHATBOT_ERROR_MESSAGE,
    CHATBOT_INSTRUCTION,
    CONTENT_GENERATION_ERROR_MESSAGE,
    CONTENT_GENERATOR_INSTRUCTION,
    build_user_context,
    classify_question_scope,
    extract_document_text,
    generate_material_content,
)
from .views import OUT_OF_SCOPE_MESSAGE, UNSAFE_MESSAGE


class IsChatbotUserTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.permission = IsChatbotUser()

    def request_for_role(self, role):
        request = self.factory.get("/api/chatbot/conversations/")
        request.user = type("User", (), {
            "is_authenticated": True,
            "role": role,
        })()
        return request

    def test_student_can_use_chatbot(self):
        self.assertTrue(self.permission.has_permission(
            self.request_for_role("student"), None
        ))

    def test_teacher_can_use_chatbot(self):
        self.assertTrue(self.permission.has_permission(
            self.request_for_role("teacher"), None
        ))

    def test_admin_cannot_use_chatbot(self):
        self.assertFalse(self.permission.has_permission(
            self.request_for_role("admin"), None
        ))

    def test_anonymous_user_cannot_use_chatbot(self):
        request = self.factory.get("/api/chatbot/conversations/")
        request.user = type("User", (), {
            "is_authenticated": False,
            "role": None,
        })()

        self.assertFalse(self.permission.has_permission(request, None))


class InstructionSeparationTests(SimpleTestCase):
    def test_chatbot_and_content_instructions_are_distinct(self):
        self.assertIsNot(CHATBOT_INSTRUCTION, CONTENT_GENERATOR_INSTRUCTION)
        self.assertIn("Socratic", CHATBOT_INSTRUCTION)
        self.assertNotIn("Socratic", CONTENT_GENERATOR_INSTRUCTION)


class QuestionScopeTests(SimpleTestCase):
    @patch("api.chatbot.gemini_service.scope_classifier_model")
    def test_classifier_returns_valid_category(self, classifier_model):
        classifier_model.generate_content.return_value = Mock(
            text='{"category": "educational"}'
        )

        self.assertEqual(classify_question_scope("Jelaskan fotosintesis"), "educational")

    @patch("api.chatbot.gemini_service.scope_classifier_model")
    def test_classifier_falls_back_to_ambiguous_for_invalid_response(self, classifier_model):
        classifier_model.generate_content.return_value = Mock(text='{"category": "unknown"}')

        self.assertEqual(classify_question_scope("Pertanyaan"), "ambiguous")


class GeminiErrorHandlingTests(SimpleTestCase):
    @patch("api.chatbot.gemini_service.scope_classifier_model")
    def test_classifier_error_falls_back_to_ambiguous_without_exposing_error(self, classifier_model):
        classifier_model.generate_content.side_effect = RuntimeError("secret provider detail")

        self.assertEqual(classify_question_scope("Pertanyaan"), "ambiguous")

    @patch("api.chatbot.gemini_service.chatbot_model")
    def test_chatbot_error_returns_safe_message(self, chatbot_model):
        chatbot_model.start_chat.side_effect = RuntimeError("secret provider detail")

        from .gemini_service import ask_gemini

        result = ask_gemini("Jelaskan energi")

        self.assertEqual(result, CHATBOT_ERROR_MESSAGE)
        self.assertNotIn("secret provider detail", result)

    @patch("api.chatbot.gemini_service.content_model")
    def test_content_generation_error_returns_safe_message(self, content_model):
        content_model.start_chat.side_effect = RuntimeError("secret provider detail")

        from .gemini_service import generate_material_content

        result = generate_material_content("C:/missing.pdf", "application/pdf")

        self.assertEqual(result, CONTENT_GENERATION_ERROR_MESSAGE)
        self.assertNotIn("secret provider detail", result)


class BuildUserContextTests(SimpleTestCase):
    def make_user(self, role, profile_name=None, **profile_values):
        profile = type("Profile", (), profile_values)() if profile_name else None
        return type("User", (), {
            "role": role,
            profile_name: profile,
        })()

    def test_student_context_maps_junior_high_grade(self):
        user = self.make_user("student", "student_profile", grade="8")

        self.assertIn("Jenjang pendidikan: SMP", build_user_context(user))
        self.assertIn("Kelas: 8", build_user_context(user))
        self.assertIn("Semua mata pelajaran", build_user_context(user))

    def test_student_context_maps_senior_high_grade(self):
        user = self.make_user("student", "student_profile", grade="11")

        self.assertIn("Jenjang pendidikan: SMA", build_user_context(user))
        self.assertIn("Kelas: 11", build_user_context(user))

    def test_teacher_context_includes_subject_without_limiting_scope(self):
        user = self.make_user("teacher", "teacher_profile", subject="Matematika")

        context = build_user_context(user)
        self.assertIn("Peran: guru", context)
        self.assertIn("Matematika", context)
        self.assertIn("semua mata pelajaran", context)

    def test_unknown_student_grade_uses_general_context(self):
        user = self.make_user("student", "student_profile", grade="大学")

        context = build_user_context(user)
        self.assertIn("tingkat belum diketahui", context)


@override_settings(
    CACHES={
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "chatbot-test-cache",
        }
    }
)
class ChatbotEndpointTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(
            email="student@example.com",
            password="TestPassword123!",
            full_name="Test Student",
            role="student",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            password="TestPassword123!",
            full_name="Other Student",
            role="student",
        )
        self.url = "/api/chatbot/conversations/"
        self.client.force_authenticate(user=self.user)

    def create_conversation(self, user=None):
        from .models import Conversation

        return Conversation.objects.create(user=user or self.user, title="Test")

    @patch("api.chatbot.views.ask_gemini")
    @patch("api.chatbot.views.classify_question_scope", return_value="educational")
    def test_allowed_question_is_saved_and_sent_to_tutor(self, classify, ask):
        ask.return_value = "Mari kita mulai dari konsep dasarnya."
        conversation = self.create_conversation()

        response = self.client.post(
            f"{self.url}{conversation.id}/message/",
            {"message": "Jelaskan fotosintesis"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        classify.assert_called_once_with("Jelaskan fotosintesis")
        ask.assert_called_once()
        self.assertEqual(conversation.messages.filter(role="user").count(), 1)
        self.assertEqual(conversation.messages.filter(role="bot").count(), 1)

    @patch("api.chatbot.views.ask_gemini")
    @patch("api.chatbot.views.classify_question_scope", return_value="out_of_scope")
    def test_out_of_scope_question_is_rejected_before_tutor(self, classify, ask):
        conversation = self.create_conversation()

        response = self.client.post(
            f"{self.url}{conversation.id}/message/",
            {"message": "Ceritakan gosip artis terbaru"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], OUT_OF_SCOPE_MESSAGE)
        ask.assert_not_called()
        self.assertEqual(conversation.messages.count(), 0)

    @patch("api.chatbot.views.ask_gemini")
    @patch("api.chatbot.views.classify_question_scope", return_value="unsafe")
    def test_unsafe_question_is_rejected_before_tutor(self, classify, ask):
        conversation = self.create_conversation()

        response = self.client.post(
            f"{self.url}{conversation.id}/message/",
            {"message": "Permintaan berbahaya"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], UNSAFE_MESSAGE)
        ask.assert_not_called()
        self.assertEqual(conversation.messages.count(), 0)

    def test_user_cannot_send_message_to_another_users_conversation(self):
        conversation = self.create_conversation(user=self.other_user)

        response = self.client.post(
            f"{self.url}{conversation.id}/message/",
            {"message": "Jelaskan energi"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(conversation.messages.count(), 0)

    @patch("api.chatbot.views.classify_question_scope", return_value="ambiguous")
    @patch("api.chatbot.views.ask_gemini", return_value="Tolong jelaskan maksud pertanyaanmu.")
    def test_ambiguous_question_is_forwarded_for_clarification(self, ask, classify):
        conversation = self.create_conversation()

        response = self.client.post(
            f"{self.url}{conversation.id}/message/",
            {"message": "Bantu saya"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ask.assert_called_once()
        self.assertEqual(conversation.messages.filter(role="user").count(), 1)
        self.assertEqual(conversation.messages.filter(role="bot").count(), 1)

    def test_blank_message_is_rejected_before_rate_limit_or_ai(self):
        conversation = self.create_conversation()

        response = self.client.post(
            f"{self.url}{conversation.id}/message/",
            {"message": "   "},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Message is required")

    def test_oversized_message_is_rejected(self):
        conversation = self.create_conversation()

        response = self.client.post(
            f"{self.url}{conversation.id}/message/",
            {"message": "x" * (settings.CHATBOT_MAX_MESSAGE_LENGTH + 1)},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("cannot exceed", response.data["error"])

    @patch("api.chatbot.views.ask_gemini", return_value="Jawaban")
    @patch("api.chatbot.views.classify_question_scope", return_value="educational")
    def test_rate_limit_returns_429_after_configured_count(self, classify, ask):
        conversation = self.create_conversation()
        for index in range(settings.CHATBOT_RATE_LIMIT_COUNT):
            response = self.client.post(
                f"{self.url}{conversation.id}/message/",
                {"message": f"Pertanyaan {index}"},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(
            f"{self.url}{conversation.id}/message/",
            {"message": "Pertanyaan berikutnya"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(ask.call_count, settings.CHATBOT_RATE_LIMIT_COUNT)

    @patch("api.chatbot.views.ask_gemini", return_value="Jawaban")
    @patch("api.chatbot.views.classify_question_scope", return_value="educational")
    def test_history_uses_recent_messages_and_selected_old_messages(self, classify, ask):
        conversation = self.create_conversation()
        from .models import ChatMessage

        old_message = ChatMessage.objects.create(
            conversation=conversation, role="user", content="Pembahasan lama"
        )
        for index in range(settings.CHATBOT_HISTORY_LIMIT + 2):
            ChatMessage.objects.create(
                conversation=conversation, role="user", content=f"Recent {index}"
            )

        response = self.client.post(
            f"{self.url}{conversation.id}/message/",
            {
                "message": "Lanjutkan",
                "context_message_ids": [old_message.id, old_message.id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        history = ask.call_args.args[1]
        contents = [part["parts"][0] for part in history]
        self.assertIn("Pembahasan lama", contents)
        self.assertEqual(len(contents), len(set(contents)))
        self.assertLessEqual(len(history), settings.CHATBOT_MAX_CONTEXT_MESSAGES)

    @patch("api.chatbot.views.ask_gemini", return_value="Jawaban")
    @patch("api.chatbot.views.classify_question_scope", return_value="educational")
    def test_selected_message_from_other_conversation_is_ignored(self, classify, ask):
        conversation = self.create_conversation()
        other_conversation = self.create_conversation(user=self.other_user)
        from .models import ChatMessage

        foreign_message = ChatMessage.objects.create(
            conversation=other_conversation, role="user", content="Rahasia conversation lain"
        )

        response = self.client.post(
            f"{self.url}{conversation.id}/message/",
            {"message": "Jelaskan energi", "context_message_ids": [foreign_message.id]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        history = ask.call_args.args[1]
        contents = [part["parts"][0] for part in history]
        self.assertNotIn("Rahasia conversation lain", contents)

    @patch("api.chatbot.views.ask_gemini", side_effect=RuntimeError("provider secret detail"))
    @patch("api.chatbot.views.classify_question_scope", return_value="educational")
    def test_provider_failure_keeps_response_safe_and_saves_messages(self, classify, ask):
        conversation = self.create_conversation()

        response = self.client.post(
            f"{self.url}{conversation.id}/message/",
            {"message": "Jelaskan energi"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("provider secret detail", str(response.data))
        self.assertEqual(response.data["bot_message"]["content"], CHATBOT_ERROR_MESSAGE)
        self.assertEqual(conversation.messages.filter(role="user").count(), 1)
        self.assertEqual(conversation.messages.filter(role="bot").count(), 1)
        classify.assert_called_once_with("Jelaskan energi")
        ask.assert_called_once()

    @patch("api.chatbot.views.ask_gemini", return_value="Tolong perjelas pertanyaanmu.")
    @patch("api.chatbot.views.classify_question_scope", side_effect=RuntimeError("classifier secret detail"))
    def test_classifier_failure_falls_back_to_tutoring_flow(self, classify, ask):
        conversation = self.create_conversation()

        response = self.client.post(
            f"{self.url}{conversation.id}/message/",
            {"message": "Bantu saya memahami aljabar"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["bot_message"]["content"], "Tolong perjelas pertanyaanmu.")
        self.assertEqual(conversation.messages.filter(role="user").count(), 1)
        self.assertEqual(conversation.messages.filter(role="bot").count(), 1)
        classify.assert_called_once_with("Bantu saya memahami aljabar")
        ask.assert_called_once()


class MaterialTextGenerationTests(SimpleTestCase):
    def test_extracts_txt_without_provider_upload(self):
        with tempfile.NamedTemporaryFile(suffix=".txt", mode="w", encoding="utf-8", delete=False) as document:
            document.write("Materi fotosintesis")
            path = document.name
        try:
            self.assertEqual(extract_document_text(path, "text/plain"), "Materi fotosintesis")
        finally:
            Path(path).unlink(missing_ok=True)

    @patch("api.chatbot.gemini_service.genai.upload_file")
    @patch("api.chatbot.gemini_service.content_model")
    def test_generator_sends_text_and_not_file_upload(self, content_model, upload_file):
        with tempfile.NamedTemporaryFile(suffix=".txt", mode="w", encoding="utf-8", delete=False) as document:
            document.write("Materi fotosintesis")
            path = document.name
        try:
            content_model.generate_content.return_value.text = "# Fotosintesis"
            result = generate_material_content(path, "text/plain")
            self.assertEqual(result, "# Fotosintesis")
            upload_file.assert_not_called()
            self.assertIn("Materi fotosintesis", content_model.generate_content.call_args.args[0])
        finally:
            Path(path).unlink(missing_ok=True)

    @patch("api.chatbot.gemini_service.content_model")
    def test_generator_provider_failure_returns_safe_message(self, content_model):
        with tempfile.NamedTemporaryFile(suffix=".txt", mode="w", encoding="utf-8", delete=False) as document:
            document.write("Materi matematika")
            path = document.name
        try:
            content_model.generate_content.side_effect = RuntimeError("provider secret detail")
            self.assertEqual(generate_material_content(path, "text/plain"), CONTENT_GENERATION_ERROR_MESSAGE)
        finally:
            Path(path).unlink(missing_ok=True)

