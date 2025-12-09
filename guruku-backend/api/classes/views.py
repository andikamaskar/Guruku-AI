from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Class
from .serializers import ClassSerializer
from django.shortcuts import get_object_or_404


class ClassListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check if we want all classes (for recommendations) or just joined ones
        mode = request.query_params.get('mode', 'joined') # 'joined' or 'all'
        
        if request.user.role == 'teacher':
            classes = Class.objects.filter(teacher=request.user)
        else:
            # Student logic
            if mode == 'all':
                # Filter by grade if student has a profile
                classes = Class.objects.all()
                if hasattr(request.user, 'student_profile') and request.user.student_profile.grade:
                    classes = classes.filter(grade=request.user.student_profile.grade)
                
                # Exclude joined classes from "all/recommended" list if needed, 
                # or just return all and let frontend filter. 
                # For now, let's return all matching grade.
            else:
                # Default: joined classes
                classes = request.user.joined_classes.all()

        serializer = ClassSerializer(classes, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'teacher':
            return Response({"error": "Hanya guru yang dapat membuat kelas."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ClassSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(teacher=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ClassJoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        invite_code = request.data.get("invite_code")
        if not invite_code:
            return Response({"error": "Kode undangan diperlukan."}, status=status.HTTP_400_BAD_REQUEST)

        class_obj = get_object_or_404(Class, invite_code=invite_code)
        if request.user.role != 'student':
            return Response({"error": "Hanya siswa yang dapat bergabung dengan kelas."}, status=status.HTTP_403_FORBIDDEN)

        class_obj.students.add(request.user)
        return Response({"message": f"Berhasil bergabung ke kelas {class_obj.name}"}, status=status.HTTP_200_OK)
