# NST Register

A conference walk-in registration app with a standalone JavaScript frontend and Django API. The ticket price is fixed at GHS 150. Each saved attendee records their name, phone number, payment method, registering user, and timestamp.

## Project layout

- `frontend/` contains the static multi-page JavaScript app for Vercel.
- `frontend/pages/admin/`, `frontend/static/css/admin/`, and `frontend/static/js/admin/` contain the separate admin pages and their page assets.
- `backend/` contains the Django API for Render.

## Run locally

1. Create and activate a Python virtual environment from `backend/`.
2. Install dependencies with `pip install -r requirements.txt`.
3. Create the database tables with `python manage.py migrate`.
4. Create the administrator account from `backend/` with `python manage.py createsuperuser` (or `.\.venv\Scripts\python.exe manage.py createsuperuser` in PowerShell).
5. Start Django from `backend/` with `python manage.py runserver`.
6. From `frontend/`, start the built-in dev server with `node dev-server.js`. It serves the app at `http://localhost:3000`; `frontend/config.js` points to the local Django API by default.

Both roles use the same custom sign-in page. Admins land on their separate **Admin overview** and have an administration sidebar with team management, attendees, revenue, registration, and activity logs. Front desk accounts land on the front desk overview and cannot manage team accounts or view admin activity logs.

Creating, editing, and deleting attendee registrations records an audit entry with the acting user, timestamp, attendee details, and any before-and-after field values. Admins can review these entries on **Activity logs**. Deleted attendee records remain represented in the audit history.

## Deploy the backend to Render

1. Push this repository to GitHub, then create a Render Blueprint using `backend/render.yaml`. It creates the Django web service and PostgreSQL database.
2. In the Render service environment, set `FRONTEND_URL` to the Vercel site origin (for example, `https://nst-register.vercel.app`). Add any additional Vercel domains as comma-separated origins.
3. Set `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in Render. Choose a strong password that passes Django's password checks. These values stay in Render's environment and are never put in the frontend or repository.
4. Keep Render's generated `DJANGO_SECRET_KEY`. `DJANGO_ALLOWED_HOSTS` is prefilled for the default `gather-registration-api.onrender.com` service. Update it if you rename the Render service or attach another API hostname.

The start command applies migrations and creates or synchronizes the administrator account from those three `ADMIN_*` variables before starting Gunicorn. Changing the admin environment values and restarting the service updates the account. Attendee data is stored in PostgreSQL.

## Deploy the frontend to Vercel

1. Import this repository into Vercel and set the project **Root Directory** to `frontend`.
2. Keep the Vercel API rewrite in `frontend/vercel.json`. It proxies `/api/*` to `https://gather-registration-api.onrender.com`, so browser requests and session cookies stay on the Vercel origin. If you change the Render service name, update that destination to match.
3. Set `FRONTEND_URL` in Render to the exact production Vercel origin (no trailing slash), then redeploy the backend.

The local `frontend/config.js` automatically uses Django at `http://localhost:8000` on localhost. On Vercel it uses the same-origin proxy. Both deployments use HTTPS and credentialed Django session authentication.

## API overview

- `POST /api/auth/login/`, `POST /api/auth/logout/`, `GET /api/auth/me/`
- `GET|POST /api/team/`
- `GET|POST /api/attendees/`, `GET|PATCH|DELETE /api/attendees/:id/`
- `GET /api/audit-logs/` (administrator only)
- `GET /api/overview/`, `GET /api/revenue/`

The attendee create endpoint sets the amount to GHS 150 on the server. The frontend does not send or control the charged amount.
