from django.db import models as db_models
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import DoctorProfile, User
from .permissions import IsAdmin
from .serializers import (
    AddStaffSerializer,
    DoctorProfileSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)


def _success(data=None, message="", status_code=status.HTTP_200_OK):
    return Response(
        {"success": True, "data": data, "message": message},
        status=status_code,
    )


# ---------------------------------------------------------------------------
# Auth views
# ---------------------------------------------------------------------------

class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "anon"

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return _success(
            data={
                "user": UserSerializer(user).data,
                "token": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            message="Registration successful.",
            status_code=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "anon"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return _success(
            data={
                "user": UserSerializer(user).data,
                "token": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            message="Login successful.",
        )


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return _success(message="Logged out successfully.")


class MeView(APIView):
    def get(self, request):
        return _success(data=UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return _success(data=serializer.data, message="Profile updated.")


# ---------------------------------------------------------------------------
# Doctor views (admin only)
# ---------------------------------------------------------------------------

class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorProfileSerializer

    def get_permissions(self):
        # Allow public access when filtering by approved status (for about page)
        if self.request.query_params.get("status") == "approved":
            return [AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        qs = DoctorProfile.objects.select_related("user").all()
        approval_status = self.request.query_params.get("status")
        if approval_status:
            qs = qs.filter(approval_status=approval_status)
        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return _success(data=response.data)


class DoctorDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAdmin]
    serializer_class = DoctorProfileSerializer
    queryset = DoctorProfile.objects.select_related("user").all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return _success(data=DoctorProfileSerializer(instance).data)


class DoctorApproveView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        profile = DoctorProfile.objects.get(pk=pk)
        profile.approval_status = "approved"
        profile.save(update_fields=["approval_status", "updated_at"])
        return _success(
            data=DoctorProfileSerializer(profile).data,
            message="Doctor approved.",
        )


class DoctorRejectView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        profile = DoctorProfile.objects.get(pk=pk)
        profile.approval_status = "rejected"
        profile.save(update_fields=["approval_status", "updated_at"])
        return _success(
            data=DoctorProfileSerializer(profile).data,
            message="Doctor rejected.",
        )


class AddStaffView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = AddStaffSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        profile = DoctorProfile.objects.select_related("user").get(user=user)
        return _success(
            data=DoctorProfileSerializer(profile).data,
            message="Staff member added.",
            status_code=status.HTTP_201_CREATED,
        )


class DeleteStaffView(APIView):
    permission_classes = [IsAdmin]

    def delete(self, request, pk):
        profile = DoctorProfile.objects.select_related("user").get(pk=pk)
        user = profile.user
        profile.delete()
        user.delete()
        return _success(message="Staff member deleted.")


# ---------------------------------------------------------------------------
# Patient views (admin only)
# ---------------------------------------------------------------------------

class PatientListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        qs = User.objects.filter(role="PATIENT")
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                db_models.Q(name__icontains=search)
                | db_models.Q(phone__icontains=search)
                | db_models.Q(address__icontains=search)
            )
        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return _success(data=response.data)


class PatientDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAdmin]
    serializer_class = UserSerializer
    queryset = User.objects.filter(role="PATIENT")

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return _success(data=UserSerializer(instance).data)
