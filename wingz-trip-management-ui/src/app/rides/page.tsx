"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRideList, type RideListParams } from "@/lib/rides-api";
import type { Ride } from "@/types/api";
import { useTheme } from "@/contexts/theme-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const pageSizeOptions = [10, 20, 50];
const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "en-route", label: "En route" },
  { value: "pickup", label: "Pickup" },
  { value: "dropoff", label: "Dropoff" },
];
const orderingOptions = [
  { value: "-pickup_time", label: "Newest first" },
  { value: "pickup_time", label: "Oldest first" },
  { value: "distance_to_pickup", label: "Nearest pickup" },
  { value: "-distance_to_pickup", label: "Farthest pickup" },
];

// Default reference point for distance sort (SF area – matches mock data)
const DEFAULT_REF_LAT = 37.7749;
const DEFAULT_REF_LON = -122.4194;

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function RideCard({ ride }: { ride: Ride }) {
  const riderName = `${ride.id_rider.first_name} ${ride.id_rider.last_name}`.trim() || ride.id_rider.email;
  const driverName = `${ride.id_driver.first_name} ${ride.id_driver.last_name}`.trim() || ride.id_driver.email;
  return (
    <div className="rounded-xl border border-surface-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm transition hover:shadow-md dark:hover:shadow-gray-900/50">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-gray-400">
            Ride #{ride.id_ride}
          </span>
          <p className="mt-1 font-medium text-surface-900 dark:text-gray-100">{ride.status}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            ride.status === "dropoff"
              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
              : ride.status === "pickup"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                : "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300"
          }`}
        >
          {ride.status}
        </span>
      </div>
      <dl className="mt-3 space-y-1 text-sm">
        <div>
          <span className="text-surface-500 dark:text-gray-400">Pickup:</span>{" "}
          <span className="text-surface-800 dark:text-gray-200">{formatDateTime(ride.pickup_time)}</span>
        </div>
        <div>
          <span className="text-surface-500 dark:text-gray-400">Rider:</span>{" "}
          <span className="text-surface-800 dark:text-gray-200">{riderName}</span>
          <span className="text-surface-400 dark:text-gray-500"> ({ride.id_rider.email})</span>
        </div>
        <div>
          <span className="text-surface-500 dark:text-gray-400">Driver:</span>{" "}
          <span className="text-surface-800 dark:text-gray-200">{driverName}</span>
        </div>
        {ride.todays_ride_events.length > 0 && (
          <div className="pt-2">
            <span className="text-surface-500 dark:text-gray-400">Recent events (24h):</span>
            <ul className="mt-1 list-inside list-disc text-surface-700 dark:text-gray-300">
              {ride.todays_ride_events.slice(0, 3).map((ev) => (
                <li key={ev.id_ride_event}>{ev.description}</li>
              ))}
            </ul>
          </div>
        )}
      </dl>
    </div>
  );
}

export default function RidesPage() {
  const router = useRouter();
  const { accessToken, logout, isReady } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [listParams, setListParams] = useState<RideListParams>({
    page: 1,
    pageSize: 20,
    status: "",
    riderEmail: "",
    ordering: "-pickup_time",
    latitude: undefined,
    longitude: undefined,
  });

  const { data, loading, error } = useRideList(accessToken, listParams);

  const setPage = useCallback((page: number) => {
    setListParams((prev) => ({ ...prev, page }));
  }, []);

  const setFilter = useCallback(<K extends keyof RideListParams>(key: K, value: RideListParams[K]) => {
    setListParams((prev) => {
      const next = { ...prev, [key]: value, page: 1 };
      // When switching to distance sort, fill default reference point if lat/lon not set so API actually re-sorts
      if (key === "ordering" && (value === "distance_to_pickup" || value === "-distance_to_pickup")) {
        if (next.latitude == null) next.latitude = DEFAULT_REF_LAT;
        if (next.longitude == null) next.longitude = DEFAULT_REF_LON;
      }
      return next;
    });
  }, []);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-[#0d0d0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!accessToken) {
    router.replace("/login");
    return null;
  }

  const totalPages = data
    ? Math.ceil(data.count / (listParams.pageSize ?? 20)) || 1
    : 1;
  const currentPage = listParams.page ?? 1;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-[#0d0d0f]">
      <header className="sticky top-0 z-10 border-b border-surface-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/rides" className="text-lg font-semibold text-surface-900 dark:text-white">
            Wingz Trip Management
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-surface-600 dark:text-gray-400 hover:bg-surface-100 dark:hover:bg-gray-800 hover:text-surface-900 dark:hover:text-white"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-surface-600 dark:text-gray-400 hover:bg-surface-100 dark:hover:bg-gray-800 hover:text-surface-900 dark:hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-semibold text-surface-900 dark:text-white">Rides</h1>
          {data && (
            <span className="text-surface-600 dark:text-gray-400">
              {data.count} ride{data.count !== 1 ? "s" : ""} total
            </span>
          )}
        </div>

        <div className="mb-6 rounded-xl border border-surface-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-surface-700 dark:text-gray-300">Filters & sort</p>
          <div className="flex flex-wrap gap-3">
            <select
              value={listParams.status ?? ""}
              onChange={(e) => setFilter("status", e.target.value || undefined)}
              className="rounded-lg border border-surface-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Rider email"
              value={listParams.riderEmail ?? ""}
              onChange={(e) => setFilter("riderEmail", e.target.value || undefined)}
              className="rounded-lg border border-surface-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <select
              value={listParams.ordering ?? "-pickup_time"}
              onChange={(e) => setFilter("ordering", e.target.value)}
              className="rounded-lg border border-surface-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {orderingOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {(listParams.ordering === "distance_to_pickup" ||
              listParams.ordering === "-distance_to_pickup") && (
              <>
                <span className="text-surface-600 dark:text-gray-400 text-sm self-center" title="API requires a GPS position for distance sort">
                  from
                </span>
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  aria-label="Reference latitude for distance sort"
                  value={listParams.latitude ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFilter("latitude", v === "" ? undefined : Number(v));
                  }}
                  className="w-28 rounded-lg border border-surface-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  aria-label="Reference longitude for distance sort"
                  value={listParams.longitude ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFilter("longitude", v === "" ? undefined : Number(v));
                  }}
                  className="w-28 rounded-lg border border-surface-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </>
            )}
            <select
              value={listParams.pageSize ?? 20}
              onChange={(e) => setFilter("pageSize", Number(e.target.value))}
              className="rounded-lg border border-surface-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-700 dark:text-red-300">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : data?.results.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.results.map((ride) => (
                <RideCard key={ride.id_ride} ride={ride} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-surface-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-surface-700 dark:text-gray-200 hover:bg-surface-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-2 text-sm text-surface-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-surface-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-surface-700 dark:text-gray-200 hover:bg-surface-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-surface-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center text-surface-600 dark:text-gray-400 shadow-sm">
            No rides found. Adjust filters or add rides in the backend.
          </div>
        )}
      </main>
    </div>
  );
}
