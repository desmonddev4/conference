import os

from django.contrib.auth import get_user_model, password_validation
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create or synchronize the initial administrator from Render environment variables."

    def handle(self, *args, **options):
        username = os.environ.get("ADMIN_USERNAME", "").strip()
        email = os.environ.get("ADMIN_EMAIL", "").strip()
        password = os.environ.get("ADMIN_PASSWORD", "")
        if not username or not email or not password:
            raise CommandError(
                "Set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD in the service environment."
            )

        user_model = get_user_model()
        user = user_model.objects.filter(**{user_model.USERNAME_FIELD: username}).first()
        if user is None:
            user = user_model(**{user_model.USERNAME_FIELD: username})
            created = True
        else:
            created = False

        user.email = email
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        password_validation.validate_password(password, user=user)
        if created or not user.check_password(password):
            user.set_password(password)
        user.save()

        action = "created" if created else "synchronized"
        self.stdout.write(self.style.SUCCESS(f"Administrator account {action}."))
