from rest_framework import serializers
from .models import Class
from api.users.models import User  # pastikan sesuai path user kamu

class ClassSerializer(serializers.ModelSerializer):
    teacher_name = serializers.ReadOnlyField(source='teacher.full_name')
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = ['id', 'name', 'description', 'grade', 'teacher', 'teacher_name', 'students_count', 'invite_code', 'created_at']
        read_only_fields = ['teacher', 'invite_code', 'created_at']

    def get_students_count(self, obj):
        return obj.students.count()
