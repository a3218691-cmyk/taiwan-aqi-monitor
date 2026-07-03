import { getAlerts, getLatestOverview, getTrend, aqiColor, ALERT_THRESHOLD } from "@/lib/aqi";
import TrendChart from "@/components/TrendChart";
import OverviewTable from "@/components/OverviewTable";
import TaiwanMap from "@/components/TaiwanMap";

export const revalidate = 600;

export default async function Home() {
  const [overview, trend, alerts] = await Promise.all([
    getLatestOverview(),
    getTrend(7),
    getAlerts(50),
  ]);

  const latestFetchedAt = overview[0]?.fetched_at;

  // server 端計算摘要卡片數值
  const valid = overview.filter((r) => r.aqi != null);
  const avgAqi =
    valid.length > 0
      ? Math.round(valid.reduce((s, r) => s + (r.aqi as number), 0) / valid.length)
      : null;
  const orangeCount = overview.filter((r) => (r.aqi ?? 0) >= ALERT_THRESHOLD).length;
  const worst = valid.reduce<typeof valid[number] | null>(
    (max, r) => (max === null || (r.aqi as number) > (max.aqi as number) ? r : max),
    null
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-6 py-10 sm:px-12">
      <main className="mx-auto max-w-4xl flex flex-col gap-12">
        <header>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            台灣空氣品質監測
          </h1>
          {latestFetchedAt && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              最後更新：{new Date(latestFetchedAt).toLocaleString("zh-TW", { hour12: false, timeZone: "Asia/Taipei" })}
            </p>
          )}
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">全台平均 AQI</p>
            <p className="mt-1 text-3xl font-semibold text-black dark:text-zinc-50">
              {avgAqi ?? "-"}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">橘警站數</p>
            <p className="mt-1 text-3xl font-semibold text-black dark:text-zinc-50">
              {orangeCount}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">最糟測站</p>
            <p className="mt-1 text-3xl font-semibold text-black dark:text-zinc-50">
              {worst ? `${worst.site_name} ${worst.aqi}` : "-"}
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium text-black dark:text-zinc-50">
            全台目前 AQI 概覽
          </h2>
          <div className="mb-4">
            <TaiwanMap overview={overview} />
          </div>
          <OverviewTable overview={overview} />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium text-black dark:text-zinc-50">
            近 7 天全台平均 AQI 趨勢
          </h2>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <TrendChart points={trend} />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium text-black dark:text-zinc-50">
            告警事件（測站跨越 AQI {ALERT_THRESHOLD}）
          </h2>
          {alerts.length === 0 ? (
            <p className="text-zinc-500">近期無告警事件</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-100 dark:bg-zinc-900 text-left">
                  <tr>
                    <th className="px-4 py-2">超標時間</th>
                    <th className="px-4 py-2">縣市</th>
                    <th className="px-4 py-2">測站</th>
                    <th className="px-4 py-2">AQI</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((row, i) => (
                    <tr
                      key={`${row.site_name}-${row.fetched_at}-${i}`}
                      className="border-t border-zinc-200 dark:border-zinc-800"
                    >
                      <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                        {new Date(row.fetched_at).toLocaleString("zh-TW", { hour12: false, timeZone: "Asia/Taipei" })}
                      </td>
                      <td className="px-4 py-2">{row.county}</td>
                      <td className="px-4 py-2">{row.site_name}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-block min-w-10 rounded px-2 py-0.5 text-center font-medium ${aqiColor(
                            row.aqi
                          )}`}
                        >
                          {row.aqi}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
