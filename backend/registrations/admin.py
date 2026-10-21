from django.contrib import admin
from .models import Attendee


@admin.register(Attendee)
class AttendeeAdmin(admin.ModelAdmin):
    list_display = ("name", "phone_number", "amount_paid", "payment_method", "registered_by", "registered_at")
    list_filter = ("payment_method", "registered_at")
    search_fields = ("name", "phone_number")
