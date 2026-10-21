from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models


class Attendee(models.Model):
    class PaymentMethod(models.TextChoices):
        MOMO = "momo", "Mobile money"
        CASH = "cash", "Cash"

    name = models.CharField(max_length=160)
    phone_number = models.CharField(
        max_length=20,
        validators=[RegexValidator(r"^[+0-9][0-9 ()-]{6,19}$", "Enter a valid phone number.")],
    )
    amount_paid = models.DecimalField(max_digits=8, decimal_places=2, default=150.00, editable=False)
    payment_method = models.CharField(max_length=4, choices=PaymentMethod.choices)
    registered_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="attendees")
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-registered_at"]

    def __str__(self):
        return f"{self.name} — {self.phone_number}"


class AuditLog(models.Model):
    class Action(models.TextChoices):
        CREATED = "created", "Registration created"
        UPDATED = "updated", "Registration updated"
        DELETED = "deleted", "Registration deleted"

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="registration_audit_logs",
        null=True,
        blank=True,
    )
    actor_username = models.CharField(max_length=150)
    actor_display_name = models.CharField(max_length=301)
    actor_is_admin = models.BooleanField(default=False)
    action = models.CharField(max_length=10, choices=Action.choices)
    attendee_id = models.PositiveIntegerField()
    attendee_name = models.CharField(max_length=160)
    attendee_phone_number = models.CharField(max_length=20)
    attendee_amount_paid = models.DecimalField(max_digits=8, decimal_places=2)
    attendee_payment_method = models.CharField(max_length=4)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.get_action_display()} · {self.attendee_name} · {self.created_at:%Y-%m-%d %H:%M}"
