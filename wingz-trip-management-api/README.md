# Ride API

RESTful API built with Django REST Framework for managing ride information. Supports listing rides with related driver, rider, and recent ride events; filtering by status and rider email; sorting by pickup time or distance to pickup; and pagination. Access is restricted to authenticated users with the **admin** role.

---

## Table of Contents

- [Setup](#setup)
- [Running the project](#running-the-project)
- [API overview](#api-overview)
- [Design decisions and notes](#design-decisions-and-notes)
- [Bonus: SQL report](#bonus-sql-report)

---

## Setup

### Prerequisites

- Python 3.10+
- pip (or another Python package manager)

### Steps

1. **Clone the repository** (or unpack the project source).

2. **Create and activate a virtual environment** (recommended):

   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # macOS/Linux
   source .venv/bin/activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables** (optional; defaults work for local development):

   - `DJANGO_SECRET_KEY` – secret key (default: dev key for local use only).
   - `DJANGO_DEBUG` – set to `false` in production.
   - `DJANGO_ALLOWED_HOSTS` – comma-separated hosts (default: `localhost,127.0.0.1`).

5. **Run migrations**:

   ```bash
   python manage.py migrate
   ```

6. **Create an admin user** (so you can obtain a JWT and call the API):

   ```bash
   python manage.py createsuperuser
   ```
   Use an email address as the username; set role to **admin** (or create a normal user and set `role='admin'` in Django admin).

   Alternatively, create an admin user via the Django shell:

   ```bash
   python manage.py shell
   ```
   ```python
   from rides.models import AppUser
   AppUser.objects.create_superuser(
       email="admin@example.com",
       password="your-secure-password",
       first_name="Admin",
       last_name="User",
       role="admin",
   )
   ```

7. **(Optional) Load sample data** for testing:

   ```bash
   python manage.py load_sample_rides --replace
   ```
   Creates admin user (admin@example.com / adminpass), drivers, riders, and 30 sample rides with events. Run after migrations. Use `--replace` to clear existing rides and reload.

---

## Running the project

Start the development server:

```bash
python manage.py runserver
```

- API base URL: `http://localhost:8000/api/`
- Django admin: `http://localhost:8000/admin/`

---

## Deploy to Render

Use this repo (or the `wingz-trip-management-api` folder as the root of its own repo) and connect it to [Render](https://render.com).

1. **New → Web Service**, connect your Git repo (root = this API project).
2. **Build command:** `pip install -r requirements.txt` (or use the **Dockerfile**).
3. **Start command:** `python manage.py migrate && gunicorn ride_api.wsgi:application --bind 0.0.0.0:$PORT`
4. **Environment variables** (Render dashboard):
   - `DJANGO_SECRET_KEY` – strong random secret (or use Render’s generate).
   - `DJANGO_DEBUG` – `false`.
   - `DJANGO_ALLOWED_HOSTS` – `.onrender.com,localhost,127.0.0.1` (leading dot allows any `*.onrender.com` host).
   - `CORS_ALLOWED_ORIGINS` – your frontend origin, e.g. `https://wingz-ui.onrender.com` or `https://your-ui.vercel.app` (no trailing slash).

5. **After first deploy:** open **Shell** and run `python manage.py load_sample_rides --replace` to create the demo admin user and sample rides. Then log in at the frontend with **admin@example.com** / **adminpass**.

---

### Obtaining a JWT token

Only users with `role='admin'` can access the API. Authenticate to get an access token:

```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your-password"}'
```

Response example:

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

Use the `access` token in the `Authorization` header:

```bash
curl -H "Authorization: Bearer <access_token>" http://localhost:8000/api/rides/
```

---

## API overview

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/rides/` | List rides (paginated, filterable, sortable) |
| GET    | `/api/rides/<id_ride>/` | Retrieve a single ride |
| POST   | `/api/auth/token/` | Obtain JWT access/refresh (body: `email`, `password`) |
| POST   | `/api/auth/token/refresh/` | Refresh access token (body: `refresh`) |

### Ride list: query parameters

- **Pagination**: `page`, `page_size` (if supported by the pagination class).
- **Filtering**:
  - `status` – exact match (e.g. `en-route`, `pickup`, `dropoff`).
  - `rider_email` – rider's email (exact, case-insensitive).
- **Sorting**:
  - `ordering=pickup_time` – ascending pickup time.
  - `ordering=-pickup_time` – descending pickup time (default).
  - `ordering=distance_to_pickup` – ascending distance from given point to pickup.
  - `ordering=-distance_to_pickup` – descending distance.
  - For distance sorting, also pass `latitude` and `longitude` (e.g. `?ordering=distance_to_pickup&latitude=37.5&longitude=-122.3`).

### Example: list rides (filter + sort by distance)

```bash
curl -H "Authorization: Bearer <access_token>" \
  "http://localhost:8000/api/rides/?status=pickup&rider_email=rider@example.com&ordering=distance_to_pickup&latitude=37.5&longitude=-122.3&page=1"
```

### Response shape (ride list item)

Each ride in the list includes:

- `id_ride`, `status`, `pickup_latitude`, `pickup_longitude`, `dropoff_latitude`, `dropoff_longitude`, `pickup_time`
- `id_rider` – nested user object (id_user, role, first_name, last_name, email, phone_number)
- `id_driver` – nested user object (same fields)
- `todays_ride_events` – list of ride events in the **last 24 hours** only (id_ride_event, id_ride_id, description, created_at)

---

## Design decisions and notes

### Authentication and authorization

- **JWT** (Simple JWT) is used for API authentication; login uses **email** and password (custom `EmailTokenObtainPairView`).
- A custom permission class **AdminRoleRequired** ensures only users with `role='admin'` can access the API. Non-admin users receive 403.

### Models

- **AppUser** replaces Django's default User and matches the spec: `id_user`, `role`, `first_name`, `last_name`, `email`, `phone_number`. Table name: `rides_user`.
- **Ride** and **RideEvent** use the specified field names and table names (`rides_ride`, `rides_ride_event`). Foreign keys use `db_column` so the database columns are `id_rider`, `id_driver`, `id_ride`.

### Performance and query count

- The ride list is designed to use **at most 2–3 SQL queries**:
  1. One query for the rides on the current page with `select_related("id_rider", "id_driver")` so rider and driver are joined.
  2. One prefetch for **todays_ride_events**: a `Prefetch` with a filtered queryset (`created_at >= now - 24 hours`) so only recent events are loaded. The full `ride_events` set is never loaded.
  3. A third query for the **total count** when pagination needs it (e.g. `PageNumberPagination`).
- **todays_ride_events**: Implemented via `to_attr="todays_ride_events"` and a prefetch queryset filtered by `created_at__gte=cutoff`. The serializer reads this attribute, so no extra query is made and the full event list is never fetched.

### Sorting

- **pickup_time**: Handled by Django's `OrderingFilter` and indexed by the database when needed.
- **distance_to_pickup**: Implemented in the database by annotating with squared Euclidean distance from `(latitude, longitude)` to `(pickup_latitude, pickup_longitude)` and ordering by that annotation. Squared distance avoids `sqrt` and keeps the ordering correct while staying portable (e.g. SQLite). For very large tables, an index on pickup coordinates can help; for production, a spatial backend (e.g. PostGIS) could be used for exact distance.

### Error handling

- A custom **exception handler** (`api_exception_handler`) is set in DRF settings so unhandled exceptions return a generic message and status 500 without leaking stack traces.

### Assumptions and limitations

- The spec asks not to change the Ride table structure; therefore distance is computed in the view layer (annotation) rather than stored on Ride.
- SQLite is the default database for development; for production and large ride tables, PostgreSQL (and optional PostGIS) is recommended.

---

## Bonus: SQL report

Report: **count of trips that took more than 1 hour from pickup to drop-off, by month and driver.**

Trip duration is derived from Ride_Event: pickup is the event with description `Status changed to pickup`, and dropoff is the event with description `Status changed to dropoff`. The duration is the time between those two events per ride.

### SQLite

```sql
WITH pickup_events AS (
    SELECT
        id_ride,
        created_at AS pickup_at
    FROM rides_ride_event
    WHERE description = 'Status changed to pickup'
),
dropoff_events AS (
    SELECT
        id_ride,
        created_at AS dropoff_at
    FROM rides_ride_event
    WHERE description = 'Status changed to dropoff'
),
trip_durations AS (
    SELECT
        r.id_ride,
        r.id_driver_id,
        p.pickup_at,
        d.dropoff_at,
        (julianday(d.dropoff_at) - julianday(p.pickup_at)) * 24 AS duration_hours
    FROM rides_ride r
    INNER JOIN pickup_events p ON p.id_ride = r.id_ride
    INNER JOIN dropoff_events d ON d.id_ride = r.id_ride
    WHERE d.dropoff_at > p.pickup_at
)
SELECT
    strftime('%Y-%m', pickup_at) AS month,
    (u.first_name || ' ' || u.last_name) AS driver,
    COUNT(*) AS count_trips_over_one_hour
FROM trip_durations td
INNER JOIN rides_user u ON u.id_user = td.id_driver_id
WHERE td.duration_hours > 1
GROUP BY strftime('%Y-%m', td.pickup_at), td.id_driver_id, u.first_name, u.last_name
ORDER BY month, driver;
```

### PostgreSQL

```sql
WITH pickup_events AS (
    SELECT id_ride, created_at AS pickup_at
    FROM rides_ride_event
    WHERE description = 'Status changed to pickup'
),
dropoff_events AS (
    SELECT id_ride, created_at AS dropoff_at
    FROM rides_ride_event
    WHERE description = 'Status changed to dropoff'
),
trip_durations AS (
    SELECT
        r.id_ride,
        r.id_driver_id,
        p.pickup_at,
        d.dropoff_at,
        EXTRACT(EPOCH FROM (d.dropoff_at - p.pickup_at)) / 3600 AS duration_hours
    FROM rides_ride r
    INNER JOIN pickup_events p ON p.id_ride = r.id_ride
    INNER JOIN dropoff_events d ON d.id_ride = r.id_ride
    WHERE d.dropoff_at > p.pickup_at
)
SELECT
    to_char(pickup_at, 'YYYY-MM') AS month,
    (u.first_name || ' ' || u.last_name) AS driver,
    COUNT(*) AS count_trips_over_one_hour
FROM trip_durations td
INNER JOIN rides_user u ON u.id_user = td.id_driver_id
WHERE td.duration_hours > 1
GROUP BY to_char(td.pickup_at, 'YYYY-MM'), td.id_driver_id, u.first_name, u.last_name
ORDER BY month, driver;
```

Sample output shape:

| month   | driver   | count_trips_over_one_hour |
|---------|----------|---------------------------|
| 2024-01 | Chris H  | 4                         |
| 2024-01 | Howard Y | 5                         |
| 2024-01 | Randy W  | 2                         |
| 2024-02 | Chris H  | 7                         |
| ...     | ...      | ...                       |

---

## License

This project is provided as assessment/code sample use.
