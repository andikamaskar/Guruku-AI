from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch


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

    @override_settings(
        MATERIAL_MAX_FILE_SIZE=100,
        MATERIAL_ALLOWED_EXTENSIONS=["txt"],
        MATERIAL_ALLOWED_MIME_TYPES=["text/plain"],
    )
    def test_class_owner_uploads_valid_material_file(self):
        self.client.force_authenticate(self.teacher)
        upload = SimpleUploadedFile("lesson.txt", b"valid content", content_type="text/plain")
        response = self.client.post(self.list_url, {"title": "Uploaded lesson", "file": upload}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    @override_settings(
        MATERIAL_MAX_FILE_SIZE=100,
        MATERIAL_ALLOWED_EXTENSIONS=["txt"],
        MATERIAL_ALLOWED_MIME_TYPES=["text/plain"],
    )
    def test_material_upload_rejects_empty_file(self):
        self.client.force_authenticate(self.teacher)
        upload = SimpleUploadedFile("empty.txt", b"", content_type="text/plain")
        response = self.client.post(self.list_url, {"title": "Empty lesson", "file": upload}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(
        MATERIAL_MAX_FILE_SIZE=10,
        MATERIAL_ALLOWED_EXTENSIONS=["txt"],
        MATERIAL_ALLOWED_MIME_TYPES=["text/plain"],
    )
    def test_material_upload_rejects_oversized_file(self):
        self.client.force_authenticate(self.teacher)
        upload = SimpleUploadedFile("large.txt", b"12345678901", content_type="text/plain")
        response = self.client.post(self.list_url, {"title": "Large lesson", "file": upload}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(
        MATERIAL_MAX_FILE_SIZE=100,
        MATERIAL_ALLOWED_EXTENSIONS=["txt"],
        MATERIAL_ALLOWED_MIME_TYPES=["text/plain"],
    )
    def test_material_upload_rejects_extension_and_mime_type(self):
        self.client.force_authenticate(self.teacher)
        upload = SimpleUploadedFile("lesson.exe", b"content", content_type="application/octet-stream")
        response = self.client.post(self.list_url, {"title": "Invalid lesson", "file": upload}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(
        MATERIAL_GENERATOR_MAX_FILE_SIZE=100,
        MATERIAL_ALLOWED_EXTENSIONS=["txt"],
        MATERIAL_ALLOWED_MIME_TYPES=["text/plain"],
    )
    @patch("api.materials.views.generate_material_content", return_value="Generated content")
    def test_generator_accepts_valid_file_with_safe_temporary_name(self, generate_mock):
        self.client.force_authenticate(self.teacher)
        upload = SimpleUploadedFile("../../lesson.txt", b"content", content_type="text/plain")
        response = self.client.post("/api/materials/generate-content/", {"file": upload}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        generate_mock.assert_called_once()
        self.assertNotIn("lesson.txt", generate_mock.call_args.args[0])

    @override_settings(
        MATERIAL_GENERATOR_MAX_FILE_SIZE=100,
        MATERIAL_ALLOWED_EXTENSIONS=["txt"],
        MATERIAL_ALLOWED_MIME_TYPES=["text/plain"],
    )
    @patch("api.materials.views.default_storage.delete")
    @patch("api.materials.views.generate_material_content", side_effect=RuntimeError("provider secret detail"))
    def test_generator_cleans_up_and_hides_provider_error(
        self, generate_mock, delete_mock
    ):
        self.client.force_authenticate(self.teacher)
        upload = SimpleUploadedFile("lesson.txt", b"content", content_type="text/plain")

        response = self.client.post(
            "/api/materials/generate-content/", {"file": upload}, format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(
            response.data["error"],
            "Materi belum dapat dibuat karena layanan AI sedang mengalami gangguan.",
        )
        self.assertNotIn("provider secret detail", str(response.data))
        generate_mock.assert_called_once()
        delete_mock.assert_called_once()

    @override_settings(
        MATERIAL_GENERATOR_MAX_FILE_SIZE=10,
        MATERIAL_ALLOWED_EXTENSIONS=["txt"],
        MATERIAL_ALLOWED_MIME_TYPES=["text/plain"],
    )
    def test_generator_rejects_oversized_file(self):
        self.client.force_authenticate(self.teacher)
        upload = SimpleUploadedFile("large.txt", b"12345678901", content_type="text/plain")
        response = self.client.post("/api/materials/generate-content/", {"file": upload}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    
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

