from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Quiz
from .serializers import QuizSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def quiz_list(request):
    """
    Mengembalikan daftar semua quiz aktif.
    Bisa ditambah filter jika perlu (misal berdasarkan kelas).
    """
    quizzes = Quiz.objects.filter(is_active=True)
    serializer = QuizSerializer(quizzes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def quiz_detail_by_exam_id(request, exam_id):
    """
    Mengembalikan detail meta quiz berdasarkan exam_id.
    Respons sesuai format yang diminta frontend.
    """
    try:
        quiz = Quiz.objects.get(exam_id=exam_id, is_active=True)
    except Quiz.DoesNotExist:
        return Response(
            {"detail": "Quiz tidak ditemukan."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = QuizSerializer(quiz)
    return Response(serializer.data)
