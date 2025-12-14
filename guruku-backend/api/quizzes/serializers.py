from rest_framework import serializers
from .models import Quiz

class QuizSerializer(serializers.ModelSerializer):
    exam_id = serializers.CharField()
    invite_code = serializers.CharField(source='class_obj.invite_code', read_only=True)
    subject_name = serializers.CharField(source='class_obj.name', read_only=True)
    exam_title = serializers.CharField(source='title', read_only=True)
    total_questions_to_display = serializers.IntegerField(source='total_questions', read_only=True)
    rules = serializers.CharField(source='description', read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id',
            'exam_id',
            'invite_code',
            'subject_name',
            'exam_title',
            'total_questions_to_display',
            'duration_minutes',
            'deadline',
            'rules',
        ]
