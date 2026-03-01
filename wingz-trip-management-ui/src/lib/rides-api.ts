"use client";

import { useEffect, useState } from "react";
import { request } from "@/lib/api";
import type { RideListResponse } from "@/types/api";

export type RideListParams = {
  page?: number;
  pageSize?: number;
  status?: string;
  riderEmail?: string;
  ordering?: string;
  latitude?: number;
  longitude?: number;
};

export async function fetchRideList(
  token: string,
  params: RideListParams = {}
): Promise<RideListResponse> {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("page_size", String(params.pageSize));
  if (params.status) search.set("status", params.status);
  if (params.riderEmail) search.set("rider_email", params.riderEmail);
  if (params.ordering) search.set("ordering", params.ordering);
  if (params.latitude != null) search.set("latitude", String(params.latitude));
  if (params.longitude != null) search.set("longitude", String(params.longitude));
  const query = search.toString();
  const path = query ? `/rides/?${query}` : "/rides/";
  return request<RideListResponse>(path, { token });
}

export function useRideList(token: string | null, params: RideListParams) {
  const [data, setData] = useState<RideListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Serialize query so any change to any param triggers a refetch (avoids stale deps / missing refetch)
  const queryKey = [
    params.page,
    params.pageSize,
    params.status ?? "",
    params.riderEmail ?? "",
    params.ordering ?? "",
    params.latitude,
    params.longitude,
  ].join("|");

  useEffect(() => {
    if (!token) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchRideList(token, params)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queryKey encodes all params; params used inside effect
  }, [token, queryKey]);

  return { data, loading, error };
}
