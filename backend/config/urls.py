from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("", admin.site.urls),
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls_auth")),
    path("api/doctors/", include("apps.users.urls_doctors")),
    path("api/patients/", include("apps.users.urls_patients")),
    path("api/services/", include("apps.services.urls")),
    path("api/appointments/", include("apps.appointments.urls")),
    path("api/assessments/", include("apps.assessments.urls")),
    path("api/messages/", include("apps.messaging.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/admin/", include("apps.appointments.urls_admin")),
]
