from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Quiz, QuizAttempt
from .serializers import QuizAdminSerializer, QuizDetailSerializer, QuizAttemptSerializer

class IsTeacherOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)

        if user_role in ['admin', 'teacher']:
            return True
        
        return False

class QuizManageViewSet(viewsets.ModelViewSet):
    serializer_class = QuizAdminSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        user = self.request.user
        user_role = getattr(user, 'role', None)

        if user_role == 'admin' or user.is_superuser:
            return Quiz.objects.all()
        
        elif user_role == 'teacher':
            return Quiz.objects.filter(created_by=user)
            
        return Quiz.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class QuizStudentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Quiz.objects.filter(is_active=True)
    serializer_class = QuizDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'], serializer_class=QuizAttemptSerializer)
    def submit(self, request, pk=None):
        quiz = self.get_object()
        serializer = QuizAttemptSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(quiz=quiz)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def history(self, request):
        attempts = QuizAttempt.objects.filter(user=request.user).order_by('-submitted_at')

        data = [{
            "quiz_title": a.quiz.title,
            "score": a.score,
            "submitted_at": a.submitted_at
        } for a in attempts]
        
        return Response(data)