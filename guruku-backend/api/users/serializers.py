from rest_framework import serializers
from .models import User

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
