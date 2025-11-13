from django.urls import path
from .views import ClassListCreateView, ClassJoinView

urlpatterns = [
    path('', ClassListCreateView.as_view(), name='class-list-create'),
    path('join/', ClassJoinView.as_view(), name='class-join'),
]
