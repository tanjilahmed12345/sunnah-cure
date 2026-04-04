from django.urls import path

from .views import AssessmentDetailView, AssessmentListCreateView

urlpatterns = [
    path("", AssessmentListCreateView.as_view(), name="assessment-list-create"),
    path("<uuid:pk>/", AssessmentDetailView.as_view(), name="assessment-detail"),
]
