from django.db import models
from django.conf import settings
import uuid

User = settings.AUTH_USER_MODEL  # pakai custom user dari settings


class Class(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='taught_classes'
    )

    students = models.ManyToManyField(
        User,
        related_name='joined_classes',
        blank=True
    )

    invite_code = models.CharField(max_length=10, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Generate kode unik otomatis jika belum ada
        if not self.invite_code:
            self.invite_code = uuid.uuid4().hex[:8].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.teacher.full_name}"
