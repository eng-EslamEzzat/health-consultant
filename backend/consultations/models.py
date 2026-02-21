from django.db import models


class Patient(models.Model):
    """Represents a patient in the health consultation system."""

    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    email = models.EmailField(unique=True)

    class Meta:
        ordering = ["full_name"]
        verbose_name = "Patient"
        verbose_name_plural = "Patients"

    def __str__(self):
        return self.full_name


class Consultation(models.Model):
    """Represents a consultation session between a patient and the system."""

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="consultations",
    )
    symptoms = models.TextField()
    diagnosis = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    ai_summary = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Consultation"
        verbose_name_plural = "Consultations"
        indexes = [
            models.Index(fields=["-created_at"], name="idx_consultation_created"),
            models.Index(fields=["patient", "-created_at"], name="idx_patient_created"),
        ]

    def __str__(self):
        return f"Consultation #{self.pk} — {self.patient.full_name}"
