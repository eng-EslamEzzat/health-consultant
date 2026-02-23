import logging

from celery import shared_task
from django.db import transaction

from .models import Consultation
from .services import AIServiceError, generate_consultation_summary

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def generate_summary_task(self, consultation_id):
    """
    Background task to generate an AI summary for a consultation.
    """
    try:
        consultation = Consultation.objects.select_related("patient").get(
            pk=consultation_id
        )
    except Consultation.DoesNotExist:
        logger.error(f"Consultation {consultation_id} not found.")
        return

    if not consultation.symptoms.strip():
        logger.warning(f"Consultation {consultation_id} has empty symptoms.")
        return

    try:
        summary = generate_consultation_summary(
            symptoms=consultation.symptoms,
            diagnosis=consultation.diagnosis,
        )

        with transaction.atomic():
            consultation.ai_summary = summary
            consultation.save(update_fields=["ai_summary"])

        logger.info(f"Summary generated successfully for consultation {consultation_id}")
        return f"Summary for {consultation_id} completed."

    except AIServiceError as exc:
        logger.error(f"AI Service error for consultation {consultation_id}: {exc}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=2**self.request.retries)
    except Exception as exc:
        logger.exception(f"Unexpected error for consultation {consultation_id}: {exc}")
        raise self.retry(exc=exc, countdown=2**self.request.retries)
