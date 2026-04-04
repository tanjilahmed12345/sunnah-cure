import re

from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import DoctorProfile, User


class UserSerializer(serializers.ModelSerializer):
    avatarUrl = serializers.URLField(source="avatar_url", required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "name", "phone", "role", "gender", "age",
            "address", "avatarUrl", "createdAt", "updatedAt",
        ]
        read_only_fields = ["id", "role", "createdAt", "updatedAt"]


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, min_length=2)
    phone = serializers.CharField(max_length=20)
    password = serializers.CharField(min_length=6, write_only=True)
    confirmPassword = serializers.CharField(write_only=True)
    address = serializers.CharField(required=False, default="")
    age = serializers.IntegerField(min_value=1, max_value=120)
    gender = serializers.ChoiceField(choices=["male", "female"])

    def validate_phone(self, value):
        if not re.match(r"^01[3-9]\d{8}$", value):
            raise serializers.ValidationError("Invalid Bangladeshi phone number.")
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        return value

    def validate(self, data):
        if data["password"] != data["confirmPassword"]:
            raise serializers.ValidationError({"confirmPassword": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("confirmPassword")
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data["phone"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid phone number or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is disabled.")
        data["user"] = user
        return data


class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    userId = serializers.UUIDField(source="user.id", read_only=True)
    specialization = serializers.CharField()
    designations = serializers.ListField(child=serializers.CharField())
    experienceYears = serializers.IntegerField(source="experience_years")
    approvalStatus = serializers.CharField(source="approval_status", read_only=True)
    certificateUrls = serializers.ListField(source="certificate_urls", required=False)
    profilePictureUrl = serializers.URLField(
        source="profile_picture_url", required=False, allow_null=True
    )
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = DoctorProfile
        fields = [
            "id", "userId", "user", "specialization", "designations",
            "qualifications", "experienceYears", "bio", "approvalStatus",
            "certificateUrls", "profilePictureUrl", "createdAt", "updatedAt",
        ]
        read_only_fields = ["id", "userId", "approvalStatus", "createdAt", "updatedAt"]


class AddStaffSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, min_length=2)
    phone = serializers.CharField(max_length=20)
    gender = serializers.ChoiceField(choices=["male", "female"])
    age = serializers.IntegerField(min_value=1, max_value=120)
    address = serializers.CharField(required=False, default="")
    designations = serializers.ListField(child=serializers.CharField(), min_length=1)
    qualifications = serializers.CharField(required=False, default="")
    experienceYears = serializers.IntegerField(
        source="experience_years", required=False, default=0
    )
    bio = serializers.CharField(required=False, default="")

    def validate_phone(self, value):
        if not re.match(r"^01[3-9]\d{8}$", value):
            raise serializers.ValidationError("Invalid Bangladeshi phone number.")
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        return value

    def create(self, validated_data):
        experience_years = validated_data.pop("experience_years", 0)
        designations = validated_data.pop("designations", [])
        qualifications = validated_data.pop("qualifications", "")
        bio = validated_data.pop("bio", "")

        user = User.objects.create_user(
            phone=validated_data["phone"],
            password="changeme123",
            name=validated_data["name"],
            gender=validated_data["gender"],
            age=validated_data["age"],
            address=validated_data.get("address", ""),
            role="DOCTOR",
        )

        specialization = "hijama_therapy"
        if "raqi" in designations and "hajjam" not in designations:
            specialization = "ruqyah_therapy"

        DoctorProfile.objects.create(
            user=user,
            specialization=specialization,
            designations=designations,
            qualifications=qualifications,
            experience_years=experience_years,
            bio=bio,
            approval_status="approved",
        )
        return user
