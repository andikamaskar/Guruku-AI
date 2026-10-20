from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory

from .permissions import IsChatbotUser


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

