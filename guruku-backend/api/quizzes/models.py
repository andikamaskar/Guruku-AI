from django.db import models
from django.conf import settings
from api.classes.models import Class
import uuid

User = settings.AUTH_USER_MODEL

class Quiz(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='quizzes')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_quizzes')
    total_questions = models.PositiveIntegerField(default=0)
    max_score = models.FloatField(default=100.0)
    duration_minutes = models.PositiveIntegerField(help_text="Durasi kuis dalam menit")
    deadline = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.class_obj.name})"
