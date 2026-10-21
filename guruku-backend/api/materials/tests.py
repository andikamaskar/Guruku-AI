from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from api.classes.models import Class
from api.users.models import User

from .models import Material, MaterialProgress


class MaterialAccessTests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            email="teacher@example.com",
            password="TestPassword123!",
            full_name="Owner Teacher",
            role="teacher",
        )
        self.other_teacher = User.objects.create_user(
            email="other-teacher@example.com",
            password="TestPassword123!",
            full_name="Other Teacher",
            role="teacher",
        )
        self.student = User.objects.create_user(
            email="student@example.com",
            password="TestPassword123!",
            full_name="Student",
            role="student",
        )
        self.other_student = User.objects.create_user(
            email="other-student@example.com",
            password="TestPassword123!",
            full_name="Other Student",
            role="student",
        )
        self.class_obj = Class.objects.create(
            name="Matematika 8",
            description="Test class",
            teacher=self.teacher,
        )
        self.other_class = Class.objects.create(
            name="IPA 9",
            description="Other class",
            teacher=self.other_teacher,
        )
        self.material = Material.objects.create(
            class_obj=self.class_obj,
            title="Aljabar",
            content="Materi aljabar",
        )
        self.url = f"/api/materials/{self.material.id}/"
        self.list_url = f"/api/materials/class/{self.class_obj.id}/"

    def test_class_owner_can_list_materials(self):
        self.client.force_authenticate(self.teacher)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_class_member_can_list_and_retrieve_material(self):
        self.class_obj.students.add(self.student)
        self.client.force_authenticate(self.student)

        list_response = self.client.get(self.list_url)
        detail_response = self.client.get(self.url)

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)

    def test_non_member_cannot_access_material(self):
        self.client.force_authenticate(self.other_student)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_other_teacher_cannot_access_material(self):
        self.client.force_authenticate(self.other_teacher)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_only_class_owner_can_create_material(self):
        self.client.force_authenticate(self.other_teacher)

        response = self.client.post(
            self.list_url,
            {"title": "Unauthorized", "content": "Should fail"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Material.objects.filter(title="Unauthorized").exists())

    def test_student_cannot_update_or_delete_material(self):
        self.class_obj.students.add(self.student)
        self.client.force_authenticate(self.student)

        update_response = self.client.patch(
            self.url,
            {"title": "Changed"},
            format="json",
        )
        delete_response = self.client.delete(self.url)

        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(delete_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Material.objects.filter(id=self.material.id).exists())

    def test_student_can_mark_only_member_material_complete(self):
        self.class_obj.students.add(self.student)
        self.client.force_authenticate(self.student)

        response = self.client.post(f"{self.url}complete/", {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            MaterialProgress.objects.filter(
                student=self.student, material=self.material, is_completed=True
            ).exists()
        )

    def test_non_member_cannot_mark_material_complete(self):
        self.client.force_authenticate(self.other_student)

        response = self.client.post(f"{self.url}complete/", {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(
            MaterialProgress.objects.filter(
                student=self.other_student, material=self.material
            ).exists()
        )

    def test_student_cannot_use_material_generator(self):
        self.client.force_authenticate(self.student)

        response = self.client.post("/api/materials/generate-content/", {}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

