import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]

    operations = [
        migrations.CreateModel(
            name="Attendee",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=160)),
                ("phone_number", models.CharField(max_length=20, validators=[django.core.validators.RegexValidator(r"^[+0-9][0-9 ()-]{6,19}$", "Enter a valid phone number.")])),
                ("amount_paid", models.DecimalField(decimal_places=2, default=Decimal("150.00"), editable=False, max_digits=8)),
                ("payment_method", models.CharField(choices=[("momo", "Mobile money"), ("cash", "Cash")], max_length=4)),
                ("registered_at", models.DateTimeField(auto_now_add=True)),
                ("registered_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="attendees", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-registered_at"]},
        ),
    ]
