from unittest.mock import MagicMock, patch

from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import Consultation, Patient
from .services import AIServiceError


class GenerateSummaryViewTests(TestCase):
    """Tests for POST /api/consultations/{id}/generate-summary/"""

    def setUp(self):
        self.client = APIClient()
        self.patient = Patient.objects.create(
            full_name="Jane Doe",
            date_of_birth="1990-05-15",
            email="jane@example.com",
        )
        self.consultation = Consultation.objects.create(
            patient=self.patient,
            symptoms="Persistent headache, dizziness, blurred vision",
            diagnosis="Migraine with aura",
        )
        self.url = reverse(
            "consultations:consultation-generate-summary",
            kwargs={"pk": self.consultation.pk},
        )

    # -----------------------------------------------------------------
    # 200 — mocked OpenAI response
    # -----------------------------------------------------------------
    @override_settings(OPENAI_API_KEY="test-key")
    @patch("consultations.services.OpenAI")
    def test_generate_summary_success(self, mock_openai_cls):
        """AI summary is generated, stored, and returned."""
        mock_summary = (
            "**Chief Complaints:** Persistent headache, dizziness, blurred vision.\n\n"
            "**Assessment:** Migraine with aura.\n\n"
            "**Summary:** The patient presents with classic migraine symptoms "
            "including headache, dizziness, and visual disturbances consistent "
            "with a diagnosis of migraine with aura."
        )

        # Wire up the mock chain: OpenAI() → client.chat.completions.create()
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_choice = MagicMock()
        mock_choice.message.content = mock_summary
        mock_client.chat.completions.create.return_value = MagicMock(
            choices=[mock_choice]
        )

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["ai_summary"], mock_summary)

        # Verify the DB was updated
        self.consultation.refresh_from_db()
        self.assertEqual(self.consultation.ai_summary, mock_summary)

    # -----------------------------------------------------------------
    # 404 — consultation does not exist
    # -----------------------------------------------------------------
    def test_generate_summary_not_found(self):
        """Returns 404 for a non-existent consultation ID."""
        url = reverse(
            "consultations:consultation-generate-summary",
            kwargs={"pk": 99999},
        )
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("not found", response.data["detail"].lower())

    # -----------------------------------------------------------------
    # 400 — empty diagnosis
    # -----------------------------------------------------------------
    def test_generate_summary_missing_diagnosis(self):
        """Returns 400 when diagnosis is blank."""
        self.consultation.diagnosis = ""
        self.consultation.save()

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("diagnosis", response.data["detail"].lower())

    # -----------------------------------------------------------------
    # 400 — empty symptoms
    # -----------------------------------------------------------------
    def test_generate_summary_missing_symptoms(self):
        """Returns 400 when symptoms are blank."""
        self.consultation.symptoms = ""
        self.consultation.save()

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("symptoms", response.data["detail"].lower())

    # -----------------------------------------------------------------
    # 503 — AI service failure
    # -----------------------------------------------------------------
    @patch(
        "consultations.views.generate_consultation_summary",
        side_effect=AIServiceError("AI service is temporarily unavailable."),
    )
    def test_generate_summary_ai_failure(self, _mock_fn):
        """Returns 503 when the AI service raises an error."""
        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn("unavailable", response.data["detail"].lower())

    # -----------------------------------------------------------------
    # Idempotency — regenerating overwrites previous summary
    # -----------------------------------------------------------------
    @override_settings(OPENAI_API_KEY="test-key")
    @patch("consultations.services.OpenAI")
    def test_generate_summary_overwrites_existing(self, mock_openai_cls):
        """Calling generate-summary again replaces the old ai_summary."""
        self.consultation.ai_summary = "Old summary"
        self.consultation.save()

        new_summary = "Updated clinical summary after re-evaluation."
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_choice = MagicMock()
        mock_choice.message.content = new_summary
        mock_client.chat.completions.create.return_value = MagicMock(
            choices=[mock_choice]
        )

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.consultation.refresh_from_db()
        self.assertEqual(self.consultation.ai_summary, new_summary)
