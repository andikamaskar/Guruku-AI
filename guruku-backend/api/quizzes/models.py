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

class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField(help_text="Pertanyaan")
    order = models.PositiveIntegerField(default=0, help_text="Urutan soal")
    points = models.FloatField(default=1.0, help_text="Bobot nilai jika benar")

    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"[{self.quiz.title}] {self.text[:30]}..."

class Choice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255, help_text="Pilihan Jawaban")
    is_correct = models.BooleanField(default=False, help_text="Centang jika ini jawaban benar")

    def __str__(self):
        return f"{self.text} ({'Benar' if self.is_correct else 'Salah'})"

class QuizAttempt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    score = models.FloatField(default=0.0)
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user} - {self.quiz.title} - Score: {self.score}"

class UserAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, on_delete=models.CASCADE)