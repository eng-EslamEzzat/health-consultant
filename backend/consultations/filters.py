from django_filters import rest_framework as filters
from .models import Consultation

class ConsultationFilter(filters.FilterSet):
    patient = filters.NumberFilter(field_name="patient")

    class Meta:
        model = Consultation
        fields = ["patient"]
