from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from api.admin_panel.permissions import IsAdminRole
from django.db.models import Count, Q
from api.users.models import User, StudentProfile, TeacherProfile
from api.classes.models import Class
from api.users.serializers import UserDashboardSerializer

class AdminDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminRole]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        # Quick check strictly for admin role

        total_users = User.objects.count()
        total_students = User.objects.filter(role='student').count()
        total_teachers = User.objects.filter(role='teacher').count()
        total_classes = Class.objects.count()
        # Count pending verification for both students and teachers
        pending_verification = User.objects.filter(role__in=['student', 'teacher'], is_verified=False).count()

        return Response({
            "total_users": total_users,
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_classes": total_classes,
            "pending_verification": pending_verification
        })

    @action(detail=False, methods=['get'])
    def verifications(self, request):

        # Get unverified students AND teachers
        unverified_users = User.objects.filter(
            role__in=['student', 'teacher'], 
            is_verified=False
        ).select_related('student_profile', 'teacher_profile')
        
        serializer = UserDashboardSerializer(unverified_users, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def verify_user(self, request, pk=None):

        try:
            user = User.objects.get(pk=pk)
            user.is_verified = True
            user.save()
            return Response({"status": "verified", "user_id": user.id})
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
