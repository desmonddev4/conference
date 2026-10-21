import json
import re
from functools import wraps
from decimal import Decimal

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Count, Q, Sum
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils.dateparse import parse_date
from django.utils import timezone
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from .models import Attendee, AuditLog

PRICE = Decimal("150.00")


def api_login_required(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)
        return view(request, *args, **kwargs)
    return wrapped


def _json_body(request):
    try:
        return json.loads(request.body or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


def _serialize(attendee):
    return {
        "id": attendee.id,
        "name": attendee.name,
        "phone_number": attendee.phone_number,
        "amount_paid": str(attendee.amount_paid),
        "payment_method": attendee.payment_method,
        "payment_method_display": attendee.get_payment_method_display(),
        "registered_by": attendee.registered_by.get_username(),
        "registered_at": attendee.registered_at.isoformat(),
    }


def _record_audit(request, action, attendee, details=None):
    actor = request.user
    AuditLog.objects.create(
        actor=actor,
        actor_username=actor.get_username(),
        actor_display_name=actor.get_full_name() or actor.get_username(),
        actor_is_admin=actor.is_superuser,
        action=action,
        attendee_id=attendee.pk,
        attendee_name=attendee.name,
        attendee_phone_number=attendee.phone_number,
        attendee_amount_paid=attendee.amount_paid,
        attendee_payment_method=attendee.payment_method,
        details=details or {},
    )


@require_GET
def csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_POST
def login_view(request):
    data = _json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid request body."}, status=400)
    username = str(data.get("username", "")).strip()
    password = data.get("password", "")
    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"error": "Username or password is incorrect."}, status=400)
    login(request, user)
    return JsonResponse({"id": user.pk, "username": user.get_username(), "display_name": user.get_full_name() or user.get_username(), "is_admin": user.is_superuser})


@require_POST
@api_login_required
def logout_view(request):
    logout(request)
    return JsonResponse({"ok": True})


@require_GET
def current_user(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)
    user = request.user
    return JsonResponse({"id": user.pk, "username": user.get_username(), "display_name": user.get_full_name() or user.get_username(), "is_admin": user.is_superuser})


@require_http_methods(["GET", "POST"])
@api_login_required
def attendee_list_create(request):
    if request.method == "GET":
        query = request.GET.get("q", "").strip()
        attendees = Attendee.objects.select_related("registered_by")
        if query:
            attendees = attendees.filter(name__icontains=query) | attendees.filter(phone_number__icontains=query)
        return JsonResponse({"attendees": [_serialize(item) for item in attendees]})

    data = _json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid request body."}, status=400)
    name = str(data.get("name", "")).strip()
    phone = str(data.get("phone_number", "")).strip()
    method = data.get("payment_method")
    if not name:
        return JsonResponse({"error": "Enter the attendee's full name."}, status=400)
    if len(name) > 160:
        return JsonResponse({"error": "Name must be 160 characters or fewer."}, status=400)
    if len(phone) > 20 or not re.fullmatch(r"[+0-9][0-9 ()-]{6,19}", phone):
        return JsonResponse({"error": "Enter a valid phone number."}, status=400)
    if method not in Attendee.PaymentMethod.values:
        return JsonResponse({"error": "Choose MoMo or cash as the payment method."}, status=400)
    with transaction.atomic():
        attendee = Attendee.objects.create(
            name=name, phone_number=phone, payment_method=method, registered_by=request.user, amount_paid=PRICE
        )
        _record_audit(request, AuditLog.Action.CREATED, attendee)
    return JsonResponse({"attendee": _serialize(attendee)}, status=201)


@require_http_methods(["GET", "PATCH", "PUT", "DELETE"])
@api_login_required
def attendee_detail(request, attendee_id):
    try:
        attendee = Attendee.objects.select_related("registered_by").get(pk=attendee_id)
    except Attendee.DoesNotExist:
        return JsonResponse({"error": "Attendee not found."}, status=404)
    if request.method == "GET":
        return JsonResponse({"attendee": _serialize(attendee)})

    if request.method == "DELETE":
        deleted_attendee = _serialize(attendee)
        with transaction.atomic():
            _record_audit(request, AuditLog.Action.DELETED, attendee)
            attendee.delete()
        return JsonResponse({"ok": True, "deleted_attendee": deleted_attendee})

    data = _json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid request body."}, status=400)
    name = str(data.get("name", attendee.name)).strip()
    phone = str(data.get("phone_number", attendee.phone_number)).strip()
    method = data.get("payment_method", attendee.payment_method)
    if not name:
        return JsonResponse({"error": "Enter the attendee's full name."}, status=400)
    if len(name) > 160:
        return JsonResponse({"error": "Name must be 160 characters or fewer."}, status=400)
    if len(phone) > 20 or not re.fullmatch(r"[+0-9][0-9 ()-]{6,19}", phone):
        return JsonResponse({"error": "Enter a valid phone number."}, status=400)
    if method not in Attendee.PaymentMethod.values:
        return JsonResponse({"error": "Choose MoMo or cash as the payment method."}, status=400)

    changes = {}
    for field, new_value in (("name", name), ("phone_number", phone), ("payment_method", method)):
        old_value = getattr(attendee, field)
        if old_value != new_value:
            changes[field] = {"old": old_value, "new": new_value}
    if changes:
        with transaction.atomic():
            attendee.name = name
            attendee.phone_number = phone
            attendee.payment_method = method
            attendee.save(update_fields=["name", "phone_number", "payment_method"])
            _record_audit(request, AuditLog.Action.UPDATED, attendee, {"changes": changes})
    return JsonResponse({"attendee": _serialize(attendee), "changed": bool(changes)})


@require_GET
@api_login_required
def audit_logs(request):
    if not request.user.is_superuser:
        return JsonResponse({"error": "Only the account administrator can view activity logs."}, status=403)

    logs = AuditLog.objects.all()
    action = request.GET.get("action", "").strip()
    if action in AuditLog.Action.values:
        logs = logs.filter(action=action)
    query = request.GET.get("q", "").strip()
    if query:
        logs = logs.filter(
            Q(attendee_name__icontains=query)
            | Q(attendee_phone_number__icontains=query)
            | Q(actor_username__icontains=query)
            | Q(actor_display_name__icontains=query)
        )

    page = Paginator(logs, 50).get_page(request.GET.get("page", 1))
    return JsonResponse({
        "logs": [{
            "id": item.id,
            "action": item.action,
            "action_display": item.get_action_display(),
            "actor_username": item.actor_username,
            "actor_display_name": item.actor_display_name,
            "actor_is_admin": item.actor_is_admin,
            "attendee_id": item.attendee_id,
            "attendee_name": item.attendee_name,
            "attendee_phone_number": item.attendee_phone_number,
            "attendee_amount_paid": str(item.attendee_amount_paid),
            "attendee_payment_method": item.attendee_payment_method,
            "details": item.details,
            "created_at": item.created_at.isoformat(),
        } for item in page.object_list],
        "total": page.paginator.count,
        "page": page.number,
        "pages": page.paginator.num_pages,
    })


@require_GET
@api_login_required
def overview(request):
    summary = Attendee.objects.aggregate(total=Count("id"), revenue=Sum("amount_paid"))
    today = parse_date(request.GET.get("date", ""))
    today_count = Attendee.objects.filter(registered_at__date=today or timezone.localdate()).count()
    recent = Attendee.objects.select_related("registered_by")[:5]
    return JsonResponse({
        "total_attendees": summary["total"],
        "total_revenue": str(summary["revenue"] or Decimal("0.00")),
        "today_attendees": today_count,
        "ticket_price": str(PRICE),
        "recent_attendees": [_serialize(item) for item in recent],
    })


@require_GET
@api_login_required
def revenue(request):
    data = Attendee.objects.aggregate(total=Count("id"), revenue=Sum("amount_paid"))
    methods = Attendee.objects.values("payment_method").annotate(total=Count("id"), amount=Sum("amount_paid"))
    method_totals = {item["payment_method"]: {"count": item["total"], "amount": str(item["amount"] or Decimal("0.00"))} for item in methods}
    return JsonResponse({
        "total_attendees": data["total"],
        "total_revenue": str(data["revenue"] or Decimal("0.00")),
        "ticket_price": str(PRICE),
        "by_payment_method": method_totals,
    })


@require_http_methods(["GET", "POST"])
@api_login_required
def team_accounts(request):
    if not request.user.is_superuser:
        return JsonResponse({"error": "Only the account administrator can manage team accounts."}, status=403)
    if request.method == "GET":
        users = User.objects.order_by("date_joined")
        return JsonResponse({"users": [{
            "id": user.pk,
            "username": user.get_username(),
            "display_name": user.get_full_name() or user.get_username(),
            "is_admin": user.is_superuser,
            "is_active": user.is_active,
            "date_joined": user.date_joined.isoformat(),
        } for user in users]})
    data = _json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid request body."}, status=400)
    username = str(data.get("username", "")).strip()
    first_name = str(data.get("first_name", "")).strip()
    last_name = str(data.get("last_name", "")).strip()
    password = data.get("password", "")
    if len(username) < 3:
        return JsonResponse({"error": "Username must be at least 3 characters."}, status=400)
    if len(username) > 150:
        return JsonResponse({"error": "Username must be 150 characters or fewer."}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({"error": "That username is already in use."}, status=400)
    if not isinstance(password, str) or not password:
        return JsonResponse({"error": "Enter a password."}, status=400)
    try:
        validate_password(password)
    except ValidationError as error:
        return JsonResponse({"error": " ".join(error.messages)}, status=400)
    user = User.objects.create_user(username=username, password=password, first_name=first_name, last_name=last_name)
    return JsonResponse({"user": {
        "id": user.pk,
        "username": user.get_username(),
        "display_name": user.get_full_name() or user.get_username(),
        "is_admin": user.is_superuser,
        "is_active": user.is_active,
        "date_joined": user.date_joined.isoformat(),
    }}, status=201)
