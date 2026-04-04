from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdmin

from .models import HealthAssessment
from .serializers import AssessmentSerializer, CreateAssessmentSerializer


def _success(data=None, message="", status_code=status.HTTP_200_OK):
    return Response(
        {"success": True, "data": data, "message": message},
        status=status_code,
    )


class AssessmentListCreateView(APIView):
    def get(self, request):
        user = request.user
        if user.role == "PATIENT":
            qs = HealthAssessment.objects.filter(patient=user)
        elif user.role == "DOCTOR":
            qs = HealthAssessment.objects.filter(assigned_doctor=user)
        else:
            qs = HealthAssessment.objects.all()

        status_filter = request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)

        search = request.query_params.get("search")
        if search:
            from django.db.models import Q

            qs = qs.filter(
                Q(patient_name__icontains=search)
                | Q(patient__phone__icontains=search)
                | Q(assigned_doctor_name__icontains=search)
            )

        data = AssessmentSerializer(qs, many=True).data
        return _success(data=data)

    def post(self, request):
        if request.user.role != "PATIENT":
            return Response(
                {"success": False, "error": {"code": "FORBIDDEN", "message": "Patients only."}},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = CreateAssessmentSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        assessment = serializer.save()
        return _success(
            data=AssessmentSerializer(assessment).data,
            message="Assessment submitted.",
            status_code=status.HTTP_201_CREATED,
        )


class AssessmentDetailView(APIView):
    def _get_assessment(self, request, pk):
        try:
            assessment = HealthAssessment.objects.select_related(
                "patient", "assigned_doctor"
            ).get(pk=pk)
        except HealthAssessment.DoesNotExist:
            return None

        user = request.user
        if user.role == "PATIENT" and assessment.patient != user:
            return None
        if user.role == "DOCTOR" and assessment.assigned_doctor != user:
            return None
        return assessment

    def get(self, request, pk):
        assessment = self._get_assessment(request, pk)
        if not assessment:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )
        return _success(data=AssessmentSerializer(assessment).data)

    def patch(self, request, pk):
        if request.user.role not in ("ADMIN", "DOCTOR"):
            return Response(
                {"success": False, "error": {"code": "FORBIDDEN", "message": "Not allowed."}},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            assessment = HealthAssessment.objects.get(pk=pk)
        except HealthAssessment.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Update status
        new_status = request.data.get("status")
        if new_status and new_status in ["reviewed", "assigned"]:
            assessment.status = new_status

        # Assign doctor
        doctor_id = request.data.get("assignedDoctorId")
        if doctor_id:
            from apps.users.models import User

            try:
                doctor = User.objects.get(pk=doctor_id, role="DOCTOR")
                assessment.assigned_doctor = doctor
                assessment.assigned_doctor_name = doctor.name
                assessment.status = "assigned"
            except User.DoesNotExist:
                return Response(
                    {"success": False, "error": {"code": "NOT_FOUND", "message": "Doctor not found."}},
                    status=status.HTTP_404_NOT_FOUND,
                )

        # Admin notes
        admin_notes = request.data.get("adminNotes")
        if admin_notes is not None:
            assessment.admin_notes = admin_notes

        assessment.save()
        return _success(
            data=AssessmentSerializer(assessment).data,
            message="Assessment updated.",
        )
