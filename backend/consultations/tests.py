from unittest.mock import MagicMock, patch

from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import Consultation, Patient
from .services import AIServiceError


# =================================================================
# Patient Endpoints — GET /api/patients/  &  POST /api/patients/
# =================================================================
class PatientListCreateViewTests(TestCase):
    """Tests for GET & POST /api/patients/"""

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("consultations:patient-list")
        self.patient = Patient.objects.create(
            full_name="Jane Doe",
            date_of_birth="1990-05-15",
            email="jane@example.com",
        )

    # -- LIST ---------------------------------------------------------
    def test_list_patients(self):
        """GET returns all patients in paginated format."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["full_name"], "Jane Doe")

    def test_list_patients_empty(self):
        """GET returns empty list when no patients exist."""
        Patient.objects.all().delete()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 0)

    # -- CREATE -------------------------------------------------------
    def test_create_patient_success(self):
        """POST with valid data creates a patient."""
        data = {
            "full_name": "John Smith",
            "date_of_birth": "1985-03-20",
            "email": "john@example.com",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["full_name"], "John Smith")
        self.assertEqual(Patient.objects.count(), 2)

    def test_create_patient_duplicate_email(self):
        """POST with an already-used email returns 400."""
        data = {
            "full_name": "Another Person",
            "date_of_birth": "2000-01-01",
            "email": "jane@example.com",  # duplicate
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_patient_missing_fields(self):
        """POST with missing required fields returns 400."""
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_patient_invalid_date(self):
        """POST with a malformed date_of_birth returns 400."""
        data = {
            "full_name": "Bad Date",
            "date_of_birth": "not-a-date",
            "email": "bad@example.com",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# =================================================================
# Patient Pagination Tests
# =================================================================
class PatientPaginationTests(TestCase):
    """Tests for pagination on GET /api/patients/"""

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("consultations:patient-list")
        # Create 15 patients to exceed default page_size of 10
        for i in range(15):
            Patient.objects.create(
                full_name=f"Patient {i:02d}",
                date_of_birth="1990-01-01",
                email=f"patient{i}@example.com",
            )

    def test_pagination_default_page_size(self):
        """First page returns 10 items (default page_size)."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 10)
        self.assertEqual(response.data["count"], 15)

    def test_pagination_second_page(self):
        """Second page returns remaining 5 items."""
        response = self.client.get(self.url, {"page": 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)

    def test_pagination_custom_page_size(self):
        """Custom page_size=5 returns 5 items."""
        response = self.client.get(self.url, {"page_size": 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)

    def test_pagination_metadata(self):
        """Response includes count, next, and previous keys."""
        response = self.client.get(self.url)
        self.assertIn("count", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIsNotNone(response.data["next"])  # has page 2
        self.assertIsNone(response.data["previous"])  # no previous on page 1


# =================================================================
# Consultation Endpoints — GET & POST /api/consultations/
# =================================================================
class ConsultationListCreateViewTests(TestCase):
    """Tests for GET & POST /api/consultations/"""

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("consultations:consultation-list")
        self.patient = Patient.objects.create(
            full_name="Jane Doe",
            date_of_birth="1990-05-15",
            email="jane@example.com",
        )
        self.consultation = Consultation.objects.create(
            patient=self.patient,
            symptoms="Cough and fever",
            diagnosis="Common cold",
        )

    # -- LIST ---------------------------------------------------------
    def test_list_consultations(self):
        """GET returns all consultations with patient_name in paginated format."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["patient_name"], "Jane Doe")

    def test_list_consultations_empty(self):
        """GET returns empty list when no consultations exist."""
        Consultation.objects.all().delete()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 0)

    # -- CREATE -------------------------------------------------------
    def test_create_consultation_success(self):
        """POST with valid data creates a consultation."""
        data = {
            "patient": self.patient.pk,
            "symptoms": "Sore throat, runny nose",
            "diagnosis": "Upper respiratory infection",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["symptoms"], "Sore throat, runny nose")
        self.assertIsNone(response.data["ai_summary"])  # not generated yet
        self.assertEqual(Consultation.objects.count(), 2)

    def test_create_consultation_without_diagnosis(self):
        """POST without diagnosis succeeds (diagnosis is optional)."""
        data = {
            "patient": self.patient.pk,
            "symptoms": "Headache",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["diagnosis"], "")

    def test_create_consultation_invalid_patient(self):
        """POST with a non-existent patient ID returns 400."""
        data = {
            "patient": 99999,
            "symptoms": "Dizziness",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_consultation_missing_symptoms(self):
        """POST without symptoms returns 400."""
        data = {"patient": self.patient.pk}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_ai_summary_is_read_only(self):
        """POST cannot set ai_summary — it is read-only."""
        data = {
            "patient": self.patient.pk,
            "symptoms": "Fatigue",
            "ai_summary": "Injected summary",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data["ai_summary"])  # ignored


# =================================================================
# Consultation Pagination Tests
# =================================================================
class ConsultationPaginationTests(TestCase):
    """Tests for pagination on GET /api/consultations/"""

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("consultations:consultation-list")
        self.patient = Patient.objects.create(
            full_name="Jane Doe",
            date_of_birth="1990-05-15",
            email="jane@example.com",
        )
        # Create 15 consultations to exceed default page_size of 10
        for i in range(15):
            Consultation.objects.create(
                patient=self.patient,
                symptoms=f"Symptom set {i}",
                diagnosis=f"Diagnosis {i}",
            )

    def test_pagination_default_page_size(self):
        """First page returns 10 items (default page_size)."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 10)
        self.assertEqual(response.data["count"], 15)

    def test_pagination_second_page(self):
        """Second page returns remaining 5 items."""
        response = self.client.get(self.url, {"page": 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)

    def test_pagination_custom_page_size(self):
        """Custom page_size=5 returns 5 items."""
        response = self.client.get(self.url, {"page_size": 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)

    def test_pagination_metadata(self):
        """Response includes count, next, and previous keys."""
        response = self.client.get(self.url)
        self.assertIn("count", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIsNotNone(response.data["next"])  # has page 2
        self.assertIsNone(response.data["previous"])  # no previous on page 1


# =================================================================
# Generate Summary — POST /api/consultations/{id}/generate-summary/
# =================================================================


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

# =================================================================
# Consultation Filtering Tests
# =================================================================
class ConsultationFilterTests(TestCase):
    """Tests for filtering consultations by patient ID."""

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("consultations:consultation-list")
        
        # Create 2 patients
        self.patient1 = Patient.objects.create(
            full_name="Patient One",
            date_of_birth="1990-01-01",
            email="p1@example.com"
        )
        self.patient2 = Patient.objects.create(
            full_name="Patient Two",
            date_of_birth="1992-02-02",
            email="p2@example.com"
        )
        
        # Create 3 consultations for patient 1
        for i in range(3):
            Consultation.objects.create(
                patient=self.patient1,
                symptoms=f"Symptoms P1-{i}",
                diagnosis="Diagnosis"
            )
            
        # Create 2 consultations for patient 2
        for i in range(2):
            Consultation.objects.create(
                patient=self.patient2,
                symptoms=f"Symptoms P2-{i}",
                diagnosis="Diagnosis"
            )

    def test_filter_by_patient_id(self):
        """Filtering by ?patient=ID returns only that patient's consultations."""
        # Filter for patient 1
        response = self.client.get(self.url, {"patient": self.patient1.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 3)
        for item in response.data["results"]:
            self.assertEqual(item["patient"], self.patient1.id)

        # Filter for patient 2
        response = self.client.get(self.url, {"patient": self.patient2.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        for item in response.data["results"]:
            self.assertEqual(item["patient"], self.patient2.id)

    def test_filter_by_non_existent_patient(self):
        """Filtering by a non-existent patient ID returns 0 results."""
        response = self.client.get(self.url, {"patient": 9999})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)
