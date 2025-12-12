from rest_framework import serializers
from .models import User
from api.classes.serializers import ClassSerializer

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'full_name', 'role', 'password', 'birth_date']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            role=validated_data['role'],
            birth_date=validated_data.get("birth_date"),
        )
        user.set_password(validated_data['password'])  # << WAJIB!
        user.save()
        return user

class UserDashboardSerializer(serializers.ModelSerializer):
    joined_classes = ClassSerializer(many=True, read_only=True)
    profile_picture = serializers.SerializerMethodField()
    nisn = serializers.CharField(source='student_profile.nisn', read_only=True)
    grade = serializers.CharField(source='student_profile.grade', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'role', 'is_verified', 'joined_classes', 'profile_picture', 'nisn', 'grade']

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None

class UpdateProfileSerializer(serializers.ModelSerializer):
    nisn = serializers.CharField(write_only=True, required=False)
    grade = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['full_name', 'profile_picture', 'nisn', 'grade']

    def update(self, instance, validated_data):
        nisn = validated_data.pop('nisn', None)
        grade = validated_data.pop('grade', None)
        
        instance = super().update(instance, validated_data)
        
        if instance.role == 'student':
            from .models import StudentProfile
            profile, created = StudentProfile.objects.get_or_create(user=instance)
            
            if nisn:
                profile.nisn = nisn
            if grade:
                profile.grade = grade
            profile.save()
            
        return instance
