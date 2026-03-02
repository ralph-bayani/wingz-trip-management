# Wingz Trip Management – Frontend

Next.js + Tailwind UI for testing the ride management API. Login with an admin user, then browse and filter rides.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure API URL**

   Copy the example env and point it at your backend:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` if your backend runs on a different host/port:

   ```
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Backend requirements

- Backend must be running (e.g. `py manage.py runserver` in the API project, or use the API deployed on Render).
- Backend must allow CORS from your frontend origin (localhost in dev; your Vercel URL in production).
- Use an admin user to sign in. After running `python manage.py load_sample_rides` on the backend, use **admin@example.com** / **adminpass**.

### Demo credentials (for client testing)

The login page can show a **demo** hint: `admin@example.com` / `adminpass`. This is on by default so testers can log in without separate instructions.

- To **hide** the hint (e.g. for production): set `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=false` and rebuild.

---

## Deploy to Vercel

Use this repo (or the `wingz-trip-management-ui` folder as the root of its own repo) and connect it to [Vercel](https://vercel.com).

1. **Import** the Git repository (root = this UI project).
2. **Environment variable** (in Vercel project settings):
   - `NEXT_PUBLIC_API_URL` = your backend API base URL including `/api`, e.g. `https://your-api.onrender.com/api`.
3. Deploy. Vercel will detect Next.js and run `npm run build` and serve the app.

Ensure your backend (e.g. on Render) has `CORS_ALLOWED_ORIGINS` set to your Vercel URL (e.g. `https://your-project.vercel.app`).

## What you can do

- **Sign in** – Email + password; stores JWT in `localStorage`.
- **Rides list** – Paginated list with rider, driver, status, pickup time, and recent events (24h).
- **Filters** – Status, rider email.
- **Sort** – Pickup time (newest/oldest) or distance to a point (with lat/lon).
- **Sign out** – Clears token and returns to login.

## Scripts

- `npm run dev` – Dev server (default port 3000).
- `npm run build` – Production build.
- `npm run start` – Run production build.
- `npm run lint` – Run ESLint.
