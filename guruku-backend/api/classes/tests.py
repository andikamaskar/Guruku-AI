from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from api.users.models import User

from .models import Announcement, Class


class ClassAnnouncementAccessTests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            email="owner@example.com",
            password="TestPassword123!",
            full_name="Owner Teacher",
            role="teacher",
        )
        self.other_teacher = User.objects.create_user(
            email="other-owner@example.com",
            password="TestPassword123!",
            full_name="Other Teacher",
            role="teacher",
        )
        self.student = User.objects.create_user(
            email="member@example.com",
            password="TestPassword123!",
            full_name="Member Student",
            role="student",
        )
        self.other_student = User.objects.create_user(
            email="nonmember@example.com",
            password="TestPassword123!",
            full_name="Nonmember Student",
            role="student",
        )
        self.admin = User.objects.create_user(
            email="admin@example.com",
            password="TestPassword123!",
            full_name="Admin",
            role="admin",
            is_staff=True,
        )
        self.class_obj = Class.objects.create(
            name="Matematika 8",
            description="Test class",
            teacher=self.teacher,
        )
        self.class_obj.students.add(self.student)
        Announcement.objects.create(
            class_obj=self.class_obj,
            teacher=self.teacher,
            content="Ujian hari Jumat.",
        )
        self.url = f"/api/classes/{self.class_obj.id}/announcements/"

    def test_owner_can_read_announcements(self):
        self.client.force_authenticate(self.teacher)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_member_can_read_announcements(self):
        self.client.force_authenticate(self.student)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_non_member_cannot_read_announcements(self):
        self.client.force_authenticate(self.other_student)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_other_teacher_cannot_read_announcements(self):
        self.client.force_authenticate(self.other_teacher)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_read_announcements(self):
        self.client.force_authenticate(self.admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_create_announcement(self):
        self.client.force_authenticate(self.teacher)

        response = self.client.post(
            self.url,
            {"content": "Tugas dikumpulkan besok."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Announcement.objects.filter(
                class_obj=self.class_obj,
                content="Tugas dikumpulkan besok.",
            ).exists()
        )

    def test_non_owner_cannot_create_announcement(self):
        self.client.force_authenticate(self.other_teacher)

        response = self.client.post(
            self.url,
            {"content": "Unauthorized"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_create_announcement(self):
        self.client.force_authenticate(self.student)

        response = self.client.post(
            self.url,
            {"content": "Unauthorized"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_user_is_rejected(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

