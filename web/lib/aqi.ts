import { supabase } from "./supabase";

// 橘警門檻。需與後端 src/fetch_aqi.py 的 ORANGE_THRESHOLD 保持一致。
export const ALERT_THRESHOLD = 50;

export type AqiRecord = {
  site_name: string;
  county: string;
  aqi: number | null;
  status: string | null;
  pm25: number | null;
  publish_time: string | null;
  fetched_at: string;
};

export async function getLatestOverview(): Promise<AqiRecord[]> {
  // 每一輪抓取會用同一個 fetched_at 時間戳整批寫入，
  // 所以先找出最新一輪的時間戳，再撈那一輪的全部測站，確保不漏站。
  const { data: latest, error: latestError } = await supabase
    .from("aqi_records")
    .select("fetched_at")
    .order("fetched_at", { ascending: false })
    .limit(1);

  if (latestError) throw latestError;
  if (!latest || latest.length === 0) return [];

  const { data, error } = await supabase
    .from("aqi_records")
    .select("site_name, county, aqi, status, pm25, publish_time, fetched_at")
    .eq("fetched_at", latest[0].fetched_at)
    .order("aqi", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data ?? []) as AqiRecord[];
}

export type TrendPoint = { hour: string; avgAqi: number };

// 把 UTC 的 ISO 時間字串轉成台灣時間（UTC+8）的「到小時」key，例如 "2026-07-02T11"
function taipeiHourKey(iso: string): string {
  const shifted = new Date(new Date(iso).getTime() + 8 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 13);
}

export async function getTrend(days = 7): Promise<TrendPoint[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("aqi_records")
    .select("fetched_at, aqi")
    .gte("fetched_at", since);

  if (error) throw error;

  const buckets = new Map<string, number[]>();
  for (const row of data ?? []) {
    if (row.aqi == null) continue;
    const hour = taipeiHourKey(row.fetched_at);
    if (!buckets.has(hour)) buckets.set(hour, []);
    buckets.get(hour)!.push(row.aqi);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([hour, values]) => ({
      hour,
      avgAqi: values.reduce((sum, v) => sum + v, 0) / values.length,
    }));
}

export async function getAlerts(limit = 50): Promise<AqiRecord[]> {
  const { data, error } = await supabase
    .from("aqi_records")
    .select("site_name, county, aqi, status, pm25, publish_time, fetched_at")
    .gte("aqi", ALERT_THRESHOLD)
    .order("fetched_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export function aqiColor(aqi: number | null): string {
  if (aqi == null) return "bg-gray-300 text-gray-800";
  if (aqi <= 50) return "bg-green-500 text-white";
  if (aqi <= 100) return "bg-yellow-400 text-black";
  if (aqi <= 150) return "bg-orange-500 text-white";
  if (aqi <= 200) return "bg-red-600 text-white";
  if (aqi <= 300) return "bg-purple-700 text-white";
  return "bg-rose-900 text-white";
}

// 與 aqiColor 同分級的實際色碼，供 SVG fill 使用（Tailwind class 不能直接當 fill）。
export function aqiHex(aqi: number | null): string {
  if (aqi == null) return "#d1d5db";
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#facc15";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#dc2626";
  if (aqi <= 300) return "#7e22ce";
  return "#881337";
}
