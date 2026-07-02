import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

TAIPEI = timezone(timedelta(hours=8))


def get_client():
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_KEY"]
    return create_client(url, key)


def insert_records(records):
    rows = [
        {
            "site_name": site_name,
            "county": county,
            "aqi": aqi,
            "status": status,
            "pm25": pm25,
            "publish_time": publish_time,
        }
        for site_name, county, aqi, status, pm25, publish_time in records
    ]
    get_client().table("aqi_records").insert(rows).execute()


def fetch_history(days=7):
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    resp = (
        get_client()
        .table("aqi_records")
        .select("fetched_at, aqi")
        .gte("fetched_at", since)
        .execute()
    )

    buckets = defaultdict(list)
    for row in resp.data:
        if row["aqi"] is not None:
            hour = datetime.fromisoformat(row["fetched_at"]).astimezone(TAIPEI).strftime("%Y-%m-%dT%H")
            buckets[hour].append(row["aqi"])

    return [
        (hour, sum(values) / len(values))
        for hour, values in sorted(buckets.items())
    ]
