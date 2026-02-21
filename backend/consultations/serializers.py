from rest_framework import serializers

from .models import Consultation, Patient


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "full_name", "date_of_birth", "email"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        """Normalise email to lowercase for consistent uniqueness checks."""
        return value.lower()


class ConsultationSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source="patient.full_name", read_only=True
    )

    class Meta:
        model = Consultation
        fields = [
            "id",
            "patient",
            "patient_name",
            "symptoms",
            "diagnosis",
            "created_at",
            "ai_summary",
        ]
        read_only_fields = ["id", "created_at", "ai_summary"]

    def validate_patient(self, value):
        """Ensure the referenced patient exists (handled by FK, but explicit)."""
        if not Patient.objects.filter(pk=value.pk).exists():
            raise serializers.ValidationError("Patient not found.")
        return value
