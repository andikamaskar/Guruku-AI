from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Material, MaterialProgress
from .serializers import MaterialSerializer
from api.classes.models import Class
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404
from api.chatbot.gemini_service import generate_material_content
import mimetypes
import os


def can_access_class(user, class_obj):
    return (
        user.role == "teacher" and class_obj.teacher_id == user.id
    ) or (
        user.role == "student" and class_obj.students.filter(id=user.id).exists()
    )


def can_manage_class(user, class_obj):
    return user.role == "teacher" and class_obj.teacher_id == user.id


def can_access_material(user, material):
    return can_access_class(user, material.class_obj)

class MaterialListCreateView(generics.ListCreateAPIView):
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        class_obj = get_object_or_404(Class, id=self.kwargs['class_id'])
        if not can_access_class(self.request.user, class_obj):
            raise PermissionDenied("Anda tidak memiliki akses ke materi kelas ini.")
        return Material.objects.filter(class_obj=class_obj).order_by('created_at')

    def perform_create(self, serializer):
        class_obj = get_object_or_404(Class, id=self.kwargs['class_id'])
        if not can_manage_class(self.request.user, class_obj):
            raise PermissionDenied("Hanya guru pemilik kelas yang dapat membuat materi.")

        # Save first to get the file path
        instance = serializer.save(class_obj=class_obj)
        
        # If file is present and content is empty, generate content
        if instance.file and not instance.content:
            try:
                file_path = instance.file.path
                mime_type, _ = mimetypes.guess_type(file_path)
                generated_content = generate_material_content(file_path, mime_type)
                instance.content = generated_content
                instance.save()
            except Exception as e:
                print(f"Error generating content: {e}")
                # Fallback or keep content empty/error handling
                pass

class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        material = get_object_or_404(Material, id=self.kwargs['pk'])
        if not can_access_material(self.request.user, material):
            raise PermissionDenied("Anda tidak memiliki akses ke materi ini.")
        if self.request.method in {"PATCH", "PUT", "DELETE"} and not can_manage_class(
            self.request.user, material.class_obj
        ):
            raise PermissionDenied("Hanya guru pemilik kelas yang dapat mengubah materi.")
        return material

    def get_queryset(self):
        return Material.objects.all() # Object access is enforced in get_object().

    def perform_update(self, serializer):
        serializer.save(class_obj=self.get_object().class_obj) 

    def perform_destroy(self, instance):
        instance.delete() 

class MarkMaterialCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, material_id):
        if request.user.role != "student":
            raise PermissionDenied("Hanya siswa yang dapat menandai materi selesai.")

        material = get_object_or_404(Material, id=material_id)
        if not can_access_material(request.user, material):
            raise PermissionDenied("Anda tidak memiliki akses ke materi ini.")

        progress, created = MaterialProgress.objects.get_or_create(
            student=request.user,
            material=material
        )
        progress.is_completed = True
        progress.save()
        return Response({'status': 'marked as complete'}, status=status.HTTP_200_OK)

class GenerateMaterialContentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def check_permissions(self, request):
        super().check_permissions(request)
        if request.user.role != "teacher":
            raise PermissionDenied("Hanya guru yang dapat menggunakan generator materi.")
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        file_obj = request.FILES['file']
        
        # Save temporary file
        try:
            # We can save it temporarily or just pass the file object if gemini_service supports it.
            # But genai.upload_file usually needs a path.
            # Let's save it to a temp location.
            import os
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            
            path = default_storage.save(f"temp/{file_obj.name}", ContentFile(file_obj.read()))
            full_path = default_storage.path(path)
            
            import mimetypes
            mime_type, _ = mimetypes.guess_type(full_path)
            
            generated_content = generate_material_content(full_path, mime_type)
            
            # Clean up temp file
            default_storage.delete(path)
            
            if "Error" in generated_content and len(generated_content) < 100:
                 return Response({'error': generated_content}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({'content': generated_content}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
