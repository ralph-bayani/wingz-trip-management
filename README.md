# Wingz Trip Management

Ride management app: **Django REST API** + **Next.js UI**. Deploy **both on Render** from this repo (one platform, one dashboard), or split API (Render) + UI (Vercel) if you prefer.

---

## Deploy everything to Render (recommended)

Render hosts **frontend and backend**: one repo, one Blueprint, two services.

1. Push this repo to GitHub/GitLab.
2. In [Render](https://render.com): **New → Blueprint**, connect the repo.
3. Render reads `render.yaml` and creates:
   - **wingz-api** – Django API (Python)
   - **wingz-ui** – Next.js UI (Node)
4. When prompted, set **NEXT_PUBLIC_API_URL** = `https://wingz-api.onrender.com/api` (your API service URL + `/api`).
5. After deploy:
   - API: `https://wingz-api.onrender.com/api`
   - UI: `https://wingz-ui.onrender.com`
6. Create an admin user and load sample data (Render **Shell** for the API service):
   ```bash
   python manage.py load_sample_rides --replace
   ```
   Then log in at the UI with **admin@example.com** / **adminpass**.

CORS is set so the UI can call the API. If your Render URLs use a different subdomain, set **CORS_ALLOWED_ORIGINS** on the API service to your UI URL.

---

## Two projects (API and UI)

| Project | Folder | Deploy to |
|--------|--------|-----------|
| **API** | `wingz-trip-management-api/` | Render (or use Blueprint above) |
| **UI** | `wingz-trip-management-ui/` | Render (Blueprint) or **Vercel** |

- **All on Render**: use the Blueprint above (same repo, `render.yaml`).
- **API on Render + UI on Vercel**: use two repos (API repo → Render, UI repo → Vercel). See [API README](wingz-trip-management-api/README.md#deploy-to-render) and [UI README](wingz-trip-management-ui/README.md#deploy-to-vercel). Set **CORS_ALLOWED_ORIGINS** on Render to your Vercel URL, and **NEXT_PUBLIC_API_URL** on Vercel to your Render API URL.

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
