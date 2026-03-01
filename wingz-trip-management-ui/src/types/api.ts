export type User = {
  id_user: number;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
};

export type RideEvent = {
  id_ride_event: number;
  id_ride_id: number;
  description: string;
  created_at: string;
};

export type Ride = {
  id_ride: number;
  status: string;
  id_rider: User;
  id_driver: User;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number | null;
  dropoff_longitude: number | null;
  pickup_time: string;
  todays_ride_events: RideEvent[];
};

export type RideListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ride[];
};

export type TokenResponse = {
  access: string;
  refresh: string;
};
