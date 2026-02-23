from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Consultation, Patient
from .serializers import ConsultationSerializer, PatientSerializer
from .tasks import generate_summary_task

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


class GenerateSummaryView(APIView):
    """
    POST /api/consultations/{id}/generate-summary/

    Retrieves a consultation's symptoms and diagnosis, sends them
    to OpenAI, stores the structured summary in ai_summary, and
    returns the updated consultation object.
    """

    def post(self, request, pk):
        # 1. Fetch consultation or 404
        try:
            consultation = Consultation.objects.select_related("patient").get(pk=pk)
        except Consultation.DoesNotExist:
            return Response(
                {"detail": "Consultation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 2. Validate required fields
        if not consultation.symptoms.strip():
            return Response(
                {"detail": "Cannot generate summary: symptoms are empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 3. Trigger background task
        generate_summary_task.delay(consultation.id)

            return Response(
            {"detail": "Summary generation started in background."},
            status=status.HTTP_202_ACCEPTED,
            )
