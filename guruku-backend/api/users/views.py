from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate

from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import RegisterSerializer, UserDashboardSerializer
from api.classes.models import Class
from api.classes.serializers import ClassSerializer
from rest_framework.permissions import IsAuthenticated


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Register berhasil",
                "user": {
                    "email": user.email,
                    "full_name": user.full_name,
                    "role": user.role,
                    "birth_date": user.birth_date
                }

            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if email is None or password is None:
            return Response({"error": "Email dan password diperlukan"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)

        if not user:
            return Response({"error": "Email atau password salah"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Login berhasil",
            "user": {
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_verified": user.is_verified
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Data User & Joined Classes
        user_serializer = UserDashboardSerializer(user)
        
        # 2. Recommended Classes (Kelas yang BELUM diikuti user)
        # Ambil 5 kelas acak/terbaru yang user tidak ada di dalamnya
        recommended_classes = Class.objects.exclude(students=user).order_by('?')[:5]
        recommended_serializer = ClassSerializer(recommended_classes, many=True)

        return Response({
            "user": user_serializer.data,
            "recommended_classes": recommended_serializer.data
        }, status=status.HTTP_200_OK)
