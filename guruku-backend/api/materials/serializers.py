import os

from django.conf import settings
from rest_framework import serializers

from .models import Material, MaterialProgress


def validate_upload(file_obj, *, max_size, allowed_extensions, allowed_mime_types, field_name):
    if not file_obj:
        return file_obj
    if file_obj.size <= 0:
        raise serializers.ValidationError({field_name: "File tidak boleh kosong."})

    extension = os.path.splitext(file_obj.name or "")[1].lower().lstrip(".")
    if extension not in {item.lower().lstrip(".") for item in allowed_extensions}:
        raise serializers.ValidationError({field_name: "Tipe ekstensi file tidak diizinkan."})
    if file_obj.size > max_size:
        raise serializers.ValidationError({field_name: "Ukuran file melebihi batas."})
    if file_obj.content_type not in allowed_mime_types:
        raise serializers.ValidationError({field_name: "Tipe MIME file tidak diizinkan."})
    return file_obj



def validate_material_file(file_obj):
    return validate_upload(
        file_obj,
        max_size=settings.MATERIAL_MAX_FILE_SIZE,
        allowed_extensions=settings.MATERIAL_ALLOWED_EXTENSIONS,
        allowed_mime_types=settings.MATERIAL_ALLOWED_MIME_TYPES,
        field_name="file",
    )



def validate_material_video(file_obj):
    return validate_upload(
        file_obj,
        max_size=settings.MATERIAL_MAX_VIDEO_SIZE,
        allowed_extensions=settings.MATERIAL_ALLOWED_VIDEO_EXTENSIONS,
        allowed_mime_types=settings.MATERIAL_ALLOWED_VIDEO_MIME_TYPES,
        field_name="video_file",
    )


class MaterialSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False, allow_null=True, validators=[validate_material_file])
    video_file = serializers.FileField(required=False, allow_null=True, validators=[validate_material_video])

    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = ['id', 'class_obj', 'title', 'content', 'video_file', 'file', 'created_at', 'is_completed']
        read_only_fields = ['id', 'created_at', 'class_obj']

    def get_is_completed(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            try:
                progress = MaterialProgress.objects.get(student=user, material=obj)
                return progress.is_completed
            except MaterialProgress.DoesNotExist:
                return False
        return False

class MaterialProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialProgress
        fields = ['id', 'student', 'material', 'is_completed', 'last_accessed']
        read_only_fields = ['id', 'student', 'material', 'last_accessed']
