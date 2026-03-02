# Wingz Trip Management

Ride management app: **Django REST API** (backend) + **Next.js UI** (frontend). Deploy both on Render from this repo, or use API on Render and UI on Vercel.

## Repository structure

| Folder | Description |
|--------|-------------|
| `wingz-trip-management-api/` | Django 4 + DRF, JWT auth, ride list API (pagination, filters, sort). See [API README](wingz-trip-management-api/README.md). |
| `wingz-trip-management-ui/` | Next.js 14 + Tailwind, login and rides dashboard. See [UI README](wingz-trip-management-ui/README.md). |

Root files: `render.yaml` (Render Blueprint), `docker-compose.yml` (local run), `.gitignore`.

---

## Deploy to Render (recommended)

1. Push this repo to GitHub/GitLab.
2. In [Render](https://render.com): **New → Blueprint**, connect the repo.
3. Render creates **wingz-api** (Python) and **wingz-ui** (Node) from `render.yaml`.
4. When prompted, set **NEXT_PUBLIC_API_URL** to your API base URL including `/api`, e.g. `https://wingz-api-XXXX.onrender.com/api` (use the exact URL from the wingz-api service).
5. After deploy, open the **wingz-api** service → **Shell** and run:
   ```bash
   python manage.py load_sample_rides --replace
   ```
   This creates the demo admin user and 30 sample rides. Log in at the UI with **admin@example.com** / **adminpass**.

If Render assigns URLs with a suffix (e.g. `wingz-ui-abc1.onrender.com`), set **CORS_ALLOWED_ORIGINS** on the API to your actual UI URL.

---

## Alternative: API on Render, UI on Vercel

Use the API folder as its own repo for Render and the UI folder as its own repo for Vercel. See [API README – Deploy to Render](wingz-trip-management-api/README.md#deploy-to-render) and [UI README – Deploy to Vercel](wingz-trip-management-ui/README.md#deploy-to-vercel). Set **CORS_ALLOWED_ORIGINS** on the API to your Vercel origin, and **NEXT_PUBLIC_API_URL** on Vercel to your API URL (e.g. `https://your-api.onrender.com/api`).

---

## Local development

**Docker (both services)**

```bash
docker-compose up --build
```

- UI: http://localhost:3000  
- API: http://localhost:8000/api  

**Without Docker**

- API: `cd wingz-trip-management-api && pip install -r requirements.txt && python manage.py migrate && python manage.py runserver`
- UI: `cd wingz-trip-management-ui && npm install && npm run dev` (set `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api` in `.env.local`)

---

## License

Assessment / code sample use.
