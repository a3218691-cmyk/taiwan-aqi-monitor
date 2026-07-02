import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "aqi.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS aqi_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site_name TEXT,
            county TEXT,
            aqi INTEGER,
            status TEXT,
            pm25 REAL,
            publish_time TEXT,
            fetched_at TEXT DEFAULT (datetime('now', 'localtime'))
        )
    """)
    return conn


def insert_records(records):
    conn = get_connection()
    conn.executemany(
        """INSERT INTO aqi_records (site_name, county, aqi, status, pm25, publish_time)
           VALUES (?, ?, ?, ?, ?, ?)""",
        records,
    )
    conn.commit()
    conn.close()


def fetch_history(days=7):
    conn = get_connection()
    rows = conn.execute(
        """SELECT fetched_at, AVG(aqi) FROM aqi_records
           WHERE fetched_at >= datetime('now', ?)
           GROUP BY substr(fetched_at, 1, 13)
           ORDER BY fetched_at""",
        (f"-{days} days",),
    ).fetchall()
    conn.close()
    return rows
