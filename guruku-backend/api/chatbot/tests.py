from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory

from .permissions import IsChatbotUser
from .gemini_service import build_user_context


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

