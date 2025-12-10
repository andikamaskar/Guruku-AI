from django.db import models
from django.conf import settings
from api.classes.models import Class
import uuid

User = settings.AUTH_USER_MODEL

class Material(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=200)
    content = models.TextField(help_text="Rich text content (HTML)")
    video_file = models.FileField(upload_to='materials/videos/', blank=True, null=True)
    file = models.FileField(upload_to='materials/files/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.class_obj.name})"

class MaterialProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='material_progress')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='progress')
    is_completed = models.BooleanField(default=False)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'material')

    def __str__(self):
        return f"{self.student.username} - {self.material.title} - {'Completed' if self.is_completed else 'In Progress'}"
