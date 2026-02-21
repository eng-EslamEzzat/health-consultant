from django.contrib import admin

from .models import Consultation, Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "email", "date_of_birth")
    search_fields = ("full_name", "email")
    list_filter = ("date_of_birth",)
    ordering = ("full_name",)


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "created_at", "short_symptoms")
    list_filter = ("created_at",)
    search_fields = ("patient__full_name", "symptoms", "diagnosis")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)

    @admin.display(description="Symptoms")
    def short_symptoms(self, obj):
        return obj.symptoms[:80] + "…" if len(obj.symptoms) > 80 else obj.symptoms
