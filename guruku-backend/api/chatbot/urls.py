from django.urls import path
from .views import (
    ConversationListCreateView,
    ChatbotMessageView,
    ConversationDetailView
)

urlpatterns = [
    path("", ConversationListCreateView.as_view()),
    path("<int:conversation_id>/", ConversationDetailView.as_view()),
    path("<int:conversation_id>/send/", ChatbotMessageView.as_view()),
]
