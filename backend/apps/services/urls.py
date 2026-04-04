from django.urls import path

from .views import ServiceDetailView, ServiceListView, ServiceUpdateView

urlpatterns = [
    path("", ServiceListView.as_view(), name="service-list"),
    path("<slug:slug>/", ServiceDetailView.as_view(), name="service-detail"),
    path("<slug:slug>/update/", ServiceUpdateView.as_view(), name="service-update"),
]
