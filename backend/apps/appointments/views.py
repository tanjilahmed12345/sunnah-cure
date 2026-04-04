from datetime import datetime

from django.db.models import Count, Q, Sum
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdmin, IsPatient

from .models import Appointment
from .serializers import AppointmentSerializer, CreateAppointmentSerializer


def _success(data=None, message="", status_code=status.HTTP_200_OK):
    return Response(
        {"success": True, "data": data, "message": message},
        status=status_code,
    )


class AppointmentListCreateView(APIView):
    def get(self, request):
        user = request.user
        qs = Appointment.objects.select_related("patient", "doctor").all()

        if user.role == "PATIENT":
            qs = qs.filter(patient=user)
        elif user.role == "DOCTOR":
            qs = qs.filter(doctor=user)
        # ADMIN sees all

        # Filters
        status_filter = request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)

        search = request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(patient__name__icontains=search)
                | Q(patient__phone__icontains=search)
                | Q(service_name__icontains=search)
            )

        date_filter = request.query_params.get("date")
        if date_filter:
            qs = qs.filter(scheduled_date=date_filter)

        data = AppointmentSerializer(qs, many=True).data
        return _success(data=data)

    def post(self, request):
        if request.user.role != "PATIENT":
            return Response(
                {"success": False, "error": {"code": "FORBIDDEN", "message": "Patients only."}},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = CreateAppointmentSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()
        return _success(
            data=AppointmentSerializer(appointment).data,
            message="Appointment created.",
            status_code=status.HTTP_201_CREATED,
        )


class AppointmentDetailView(APIView):
    def _get_appointment(self, request, pk):
        try:
            appointment = Appointment.objects.select_related(
                "patient", "doctor", "doctor__doctor_profile"
            ).get(pk=pk)
        except Appointment.DoesNotExist:
            return None

        user = request.user
        if user.role == "PATIENT" and appointment.patient != user:
            return None
        if user.role == "DOCTOR" and appointment.doctor != user:
            return None
        return appointment

    def get(self, request, pk):
        appointment = self._get_appointment(request, pk)
        if not appointment:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )
        return _success(data=AppointmentSerializer(appointment).data)

    def patch(self, request, pk):
        if request.user.role != "ADMIN":
            return Response(
                {"success": False, "error": {"code": "FORBIDDEN", "message": "Admin only."}},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            appointment = Appointment.objects.select_related("patient", "doctor").get(pk=pk)
        except Appointment.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        action = request.data.get("action")

        if action == "approve":
            appointment.approve()
            appointment.scheduled_date = request.data.get("scheduledDate")
            appointment.scheduled_time = request.data.get("scheduledTime")
            appointment.admin_notes = request.data.get("adminNotes", "")
            appointment.chat_enabled = True
            appointment.save()

        elif action == "reject":
            appointment.reject()
            appointment.rejection_reason = request.data.get("rejectionReason", "")
            appointment.save()

        elif action == "complete":
            appointment.complete()
            appointment.save()

        elif action == "assign_doctor":
            from apps.users.models import User

            doctor_id = request.data.get("doctorId")
            try:
                doctor = User.objects.get(pk=doctor_id, role="DOCTOR")
                appointment.doctor = doctor
                appointment.save(update_fields=["doctor", "updated_at"])
            except User.DoesNotExist:
                return Response(
                    {"success": False, "error": {"code": "NOT_FOUND", "message": "Doctor not found."}},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(
                {"success": False, "error": {"code": "BAD_REQUEST", "message": "Invalid action."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return _success(
            data=AppointmentSerializer(appointment).data,
            message=f"Appointment {action}d.",
        )


class AppointmentCancelView(APIView):
    def post(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk, patient=request.user)
        except Appointment.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )
        appointment.cancel()
        appointment.save()
        return _success(
            data=AppointmentSerializer(appointment).data,
            message="Appointment cancelled.",
        )


class AppointmentCalendarView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        month = request.query_params.get("month")  # YYYY-MM
        if not month:
            return Response(
                {"success": False, "error": {"code": "BAD_REQUEST", "message": "month param required."}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            year, m = month.split("-")
            year, m = int(year), int(m)
        except (ValueError, AttributeError):
            return Response(
                {"success": False, "error": {"code": "BAD_REQUEST", "message": "Invalid month format."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointments = Appointment.objects.filter(
            scheduled_date__year=year, scheduled_date__month=m
        ).values("scheduled_date").annotate(count=Count("id"))

        calendar_data = {
            str(entry["scheduled_date"]): entry["count"]
            for entry in appointments
        }
        return _success(data=calendar_data)


class AdminStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from apps.assessments.models import HealthAssessment
        from apps.payments.models import Payment
        from apps.users.models import DoctorProfile, User

        total_patients = User.objects.filter(role="PATIENT").count()
        total_appointments = Appointment.objects.count()
        pending_count = Appointment.objects.filter(status="pending").count()
        completed_count = Appointment.objects.filter(status="completed").count()
        completion_rate = (
            round(completed_count / total_appointments * 100, 1)
            if total_appointments > 0
            else 0
        )
        total_revenue = (
            Payment.objects.filter(status="completed").aggregate(
                total=Sum("amount_bdt")
            )["total"]
            or 0
        )
        total_staff = DoctorProfile.objects.filter(approval_status="approved").count()
        total_assessments = HealthAssessment.objects.count()

        today = datetime.now().date()
        today_appointments = Appointment.objects.filter(scheduled_date=today).count()

        return _success(data={
            "totalPatients": total_patients,
            "totalAppointments": total_appointments,
            "todayAppointments": today_appointments,
            "pendingCount": pending_count,
            "completionRate": completion_rate,
            "totalRevenue": float(total_revenue),
            "totalStaff": total_staff,
            "totalAssessments": total_assessments,
        })
