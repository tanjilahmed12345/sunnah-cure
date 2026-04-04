from django.urls import path

from .views import (
    AddStaffView,
    DeleteStaffView,
    DoctorApproveView,
    DoctorDetailView,
    DoctorListView,
    DoctorRejectView,
)

urlpatterns = [
    path("", DoctorListView.as_view(), name="doctor-list"),
    path("add/", AddStaffView.as_view(), name="doctor-add"),
    path("<uuid:pk>/", DoctorDetailView.as_view(), name="doctor-detail"),
    path("<uuid:pk>/approve/", DoctorApproveView.as_view(), name="doctor-approve"),
    path("<uuid:pk>/reject/", DoctorRejectView.as_view(), name="doctor-reject"),
    path("<uuid:pk>/delete/", DeleteStaffView.as_view(), name="doctor-delete"),
]
