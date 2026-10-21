from rest_framework import status
from rest_framework.test import APITestCase

from api.users.models import User


class AdminDashboardAccessTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com",
            password="TestPassword123!",
            full_name="Admin",
            role="admin",
        )
        self.student = User.objects.create_user(
            email="student@example.com",
            password="TestPassword123!",
            full_name="Student",
            role="student",
        )
        self.teacher = User.objects.create_user(
            email="teacher@example.com",
            password="TestPassword123!",
            full_name="Teacher",
            role="teacher",
        )
        self.staff_teacher = User.objects.create_user(
            email="staff-teacher@example.com",
            password="TestPassword123!",
            full_name="Staff Teacher",
            role="teacher",
            is_staff=True,
        )
        self.unverified_user = User.objects.create_user(
            email="unverified@example.com",
            password="TestPassword123!",
            full_name="Unverified Student",
            role="student",
            is_verified=False,
        )

    def test_admin_can_access_stats(self):
        self.client.force_authenticate(self.admin)

        response = self.client.get("/api/admin/stats")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_can_access_verifications(self):
        self.client.force_authenticate(self.admin)

        response = self.client.get("/api/admin/verifications")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["id"] == self.unverified_user.id for item in response.data))

    def test_admin_can_verify_user(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            f"/api/admin/{self.unverified_user.id}/verify_user",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.unverified_user.refresh_from_db()
        self.assertTrue(self.unverified_user.is_verified)

    def test_student_is_rejected_from_all_admin_endpoints(self):
        self.client.force_authenticate(self.student)

        self.assertEqual(
            self.client.get("/api/admin/stats").status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(
            self.client.get("/api/admin/verifications").status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(
            self.client.post(
                f"/api/admin/{self.unverified_user.id}/verify_user",
                {},
                format="json",
            ).status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_teacher_is_rejected(self):
        self.client.force_authenticate(self.teacher)

        response = self.client.get("/api/admin/stats")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_teacher_is_rejected(self):
        self.client.force_authenticate(self.staff_teacher)

        response = self.client.get("/api/admin/stats")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_user_is_rejected(self):
        response = self.client.get("/api/admin/stats")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_gets_404_for_unknown_user(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            "/api/admin/999999/verify_user",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
