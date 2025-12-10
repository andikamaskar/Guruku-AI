from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Material, MaterialProgress
from .serializers import MaterialSerializer, MaterialProgressSerializer
from api.classes.models import Class
from django.shortcuts import get_object_or_404

class MaterialListCreateView(generics.ListCreateAPIView):
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        class_id = self.kwargs['class_id']
        return Material.objects.filter(class_obj__id=class_id).order_by('created_at')

    def perform_create(self, serializer):
        class_id = self.kwargs['class_id']
        class_obj = get_object_or_404(Class, id=class_id)
        # Ensure only teacher can create materials (add logic if needed)
        serializer.save(class_obj=class_obj)

class MaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

class MarkMaterialCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, material_id):
        material = get_object_or_404(Material, id=material_id)
        progress, created = MaterialProgress.objects.get_or_create(
            student=request.user,
            material=material
        )
        progress.is_completed = True
        progress.save()
        return Response({'status': 'marked as complete'}, status=status.HTTP_200_OK)
