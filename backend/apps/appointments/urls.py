from django.urls import path

from .views import (
    AppointmentCalendarView,
    AppointmentCancelView,
    AppointmentDetailView,
    AppointmentListCreateView,
)

urlpatterns = [
    path("", AppointmentListCreateView.as_view(), name="appointment-list-create"),
    path("calendar/", AppointmentCalendarView.as_view(), name="appointment-calendar"),
    path("<uuid:pk>/", AppointmentDetailView.as_view(), name="appointment-detail"),
    path("<uuid:pk>/cancel/", AppointmentCancelView.as_view(), name="appointment-cancel"),
]
