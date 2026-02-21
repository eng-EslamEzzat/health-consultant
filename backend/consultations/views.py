from rest_framework import generics

from .models import Consultation, Patient
from .serializers import ConsultationSerializer, PatientSerializer

################################################################
# For Implementing meaningful error handling (400, 404, etc.)
# We don't need manual error handling in these views.
# ListCreateAPIView already handles it for us automatically.
################################################################
class PatientListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/patients/  → list all patients
    POST /api/patients/  → create a new patient
    """

    queryset = Patient.objects.all()
    serializer_class = PatientSerializer


class ConsultationListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/consultations/  → list all consultations
    POST /api/consultations/  → create a new consultation
    """

    queryset = Consultation.objects.select_related("patient").all()
    serializer_class = ConsultationSerializer
