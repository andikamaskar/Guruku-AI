from rest_framework.permissions import BasePermission


class IsChatbotUser(BasePermission):
    """Allow chatbot access only to authenticated students and teachers."""

    message = "Chatbot hanya dapat digunakan oleh siswa dan guru."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None) in {"student", "teacher"}
        )
