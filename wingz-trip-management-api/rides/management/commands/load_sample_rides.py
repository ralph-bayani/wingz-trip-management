"""
Load sample users, rides, and ride events for local testing (~30 rides).
Run after migrate: python manage.py load_sample_rides
"""
import random
from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from rides.models import AppUser, Ride, RideEvent


# San Francisco area coordinates (rough bounds)
SF_LAT = (37.70, 37.82)
SF_LON = (-122.52, -122.35)

NUM_RIDES = 30


def random_coord(lat_range, lon_range):
    return (
        round(random.uniform(*lat_range), 6),
        round(random.uniform(*lon_range), 6),
    )


def ensure_user(email, role, first_name, last_name, password="pass", phone=""):
    user, created = AppUser.objects.get_or_create(
        email=email,
        defaults={
            "role": role,
            "first_name": first_name,
            "last_name": last_name,
            "phone_number": phone or "",
        },
    )
    if not user.password or user.password == "!":
        user.set_password(password)
        user.save()
    return user


def create_ride_event(ride, description, created_at):
    event = RideEvent.objects.create(
        id_ride=ride,
        description=description,
    )
    event.created_at = created_at
    event.save(update_fields=["created_at"])
    return event


class Command(BaseCommand):
    help = "Create sample users and ~30 rides with ride events for testing the API."

    def add_arguments(self, parser):
        parser.add_argument(
            "--replace",
            action="store_true",
            help="Remove existing rides and ride events, then load 30 new rides.",
        )

    def handle(self, *args, **options):
        now = timezone.now()

        # --- Admin (for API login) ---
        admin_user = ensure_user(
            "admin@example.com",
            "admin",
            "Admin",
            "User",
            password="adminpass",
        )
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        self.stdout.write("Admin user: admin@example.com / adminpass")

        # --- Drivers ---
        drivers_data = [
            ("chris.driver@example.com", "Chris", "Howard"),
            ("howard.driver@example.com", "Howard", "Yang"),
            ("randy.driver@example.com", "Randy", "Wu"),
            ("maria.driver@example.com", "Maria", "Garcia"),
            ("james.driver@example.com", "James", "Lee"),
            ("sarah.driver@example.com", "Sarah", "Kim"),
        ]
        drivers = [ensure_user(email, "driver", fn, ln) for email, fn, ln in drivers_data]

        # --- Riders ---
        riders_data = [
            ("jane.rider@example.com", "Jane", "Doe"),
            ("john.rider@example.com", "John", "Smith"),
            ("alice.rider@example.com", "Alice", "Brown"),
            ("bob.rider@example.com", "Bob", "Wilson"),
            ("emma.rider@example.com", "Emma", "Davis"),
            ("michael.rider@example.com", "Michael", "Taylor"),
            ("olivia.rider@example.com", "Olivia", "Martinez"),
            ("william.rider@example.com", "William", "Anderson"),
            ("sophia.rider@example.com", "Sophia", "Thomas"),
            ("liam.rider@example.com", "Liam", "Jackson"),
            ("ava.rider@example.com", "Ava", "White"),
            ("noah.rider@example.com", "Noah", "Harris"),
        ]
        riders = [ensure_user(email, "rider", fn, ln) for email, fn, ln in riders_data]

        if options["replace"]:
            RideEvent.objects.all().delete()
            Ride.objects.all().delete()
            self.stdout.write("Existing rides and ride events removed.")

        current_count = Ride.objects.count()
        if current_count >= NUM_RIDES and not options["replace"]:
            self.stdout.write(
                self.style.WARNING(
                    f"Already {current_count} rides in DB. Use --replace to clear and load 30 new rides."
                )
            )
            return

        to_create = NUM_RIDES - current_count
        statuses = ["en-route", "pickup", "dropoff"]

        for i in range(to_create):
            rider = random.choice(riders)
            driver = random.choice(drivers)
            status = random.choice(statuses)

            pickup_lat, pickup_lon = random_coord(SF_LAT, SF_LON)
            dropoff_lat = dropoff_lon = None
            if status == "dropoff":
                dropoff_lat, dropoff_lon = random_coord(SF_LAT, SF_LON)

            # Pickup time: mix of last 2 hours, last 2 days, and last 2 weeks
            hour_offsets = [
                random.uniform(0.25, 2),
                random.uniform(2, 24),
                random.uniform(24, 48),
                random.uniform(48, 24 * 14),
            ]
            hours_ago = random.choice(hour_offsets)
            pickup_time = now - timedelta(hours=hours_ago)

            ride = Ride.objects.create(
                status=status,
                id_rider=rider,
                id_driver=driver,
                pickup_latitude=pickup_lat,
                pickup_longitude=pickup_lon,
                dropoff_latitude=dropoff_lat,
                dropoff_longitude=dropoff_lon,
                pickup_time=pickup_time,
            )

            # Ride events: use realistic descriptions. Keep "Status changed to pickup/dropoff" for bonus SQL report.
            t0 = pickup_time
            requested_msgs = [
                "Trip requested – driver assigned and en route",
                "Ride booked from pickup location",
                "Passenger requested ride – driver on the way",
            ]
            create_ride_event(ride, random.choice(requested_msgs), t0)

            if status in ("pickup", "dropoff"):
                t1 = t0 + timedelta(minutes=random.randint(5, 25))
                create_ride_event(ride, "Status changed to pickup", t1)
            if status == "dropoff":
                t2 = t1 + timedelta(minutes=random.randint(15, 75))
                create_ride_event(ride, "Status changed to dropoff", t2)

            # Extra recent events (realistic titles)
            if random.random() < 0.4 and hours_ago < 24:
                arrived_msgs = [
                    "Driver arrived at pickup location",
                    "Driver at pickup – passenger boarding",
                    "Vehicle at pickup point",
                ]
                create_ride_event(
                    ride,
                    random.choice(arrived_msgs),
                    now - timedelta(minutes=random.randint(5, 120)),
                )
            if random.random() < 0.3 and hours_ago < 24 and status == "dropoff":
                completed_msgs = [
                    "Trip completed – rider dropped off at destination",
                    "Ride completed successfully",
                    "Passenger dropped off – trip complete",
                ]
                create_ride_event(
                    ride,
                    random.choice(completed_msgs),
                    now - timedelta(minutes=random.randint(1, 60)),
                )

        new_total = Ride.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"Mock data loaded: {new_total} rides total. "
                "Login with admin@example.com / adminpass to test the API."
            )
        )
