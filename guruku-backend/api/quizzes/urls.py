from django.urls import path
from .views import quiz_list, quiz_detail_by_exam_id

urlpatterns = [
    path('', quiz_list, name='quiz-list'),                    # GET /api/quizzes/
    path('<str:exam_id>/', quiz_detail_by_exam_id,            # GET /api/quizzes/CODE_PY1/
         name='quiz-detail-exam'),
]