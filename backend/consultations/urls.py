from django.urls import path

from . import views

app_name = "consultations"

urlpatterns = [
    path("patients/", views.PatientListCreateView.as_view(), name="patient-list"),
    path(
        "consultations/",
        views.ConsultationListCreateView.as_view(),
        name="consultation-list",
    ),
    path(
        "consultations/<int:pk>/",
        views.ConsultationRetrieveView.as_view(),
        name="consultation-detail",
    ),
    path(
        "consultations/<int:pk>/generate-summary/",
        views.GenerateSummaryView.as_view(),
        name="consultation-generate-summary",
    ),
]
