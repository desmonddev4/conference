from django.urls import path
from django.http import JsonResponse

from registrations import views

urlpatterns = [
    path("", lambda request: JsonResponse({"service": "Gather registrations API", "status": "ok"}), name="api_root"),
    path("api/auth/csrf/", views.csrf_token, name="csrf"),
    path("api/auth/login/", views.login_view, name="api_login"),
    path("api/auth/logout/", views.logout_view, name="api_logout"),
    path("api/auth/me/", views.current_user, name="current_user"),
    path("api/attendees/", views.attendee_list_create, name="attendees_api"),
    path("api/attendees/<int:attendee_id>/", views.attendee_detail, name="attendee_detail"),
    path("api/audit-logs/", views.audit_logs, name="audit_logs"),
    path("api/overview/", views.overview, name="overview"),
    path("api/revenue/", views.revenue, name="revenue"),
    path("api/team/", views.team_accounts, name="team_accounts"),
]
