import { getAlerts, getLatestOverview, getTrend, aqiColor } from "@/lib/aqi";
import TrendChart from "@/components/TrendChart";

export const revalidate = 600;

export default async function Home() {
  const [overview, trend, alerts] = await Promise.all([
    getLatestOverview(),
    getTrend(7),
    getAlerts(50),
  ]);

  const latestFetchedAt = overview[0]?.fetched_at;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-6 py-10 sm:px-12">
      <main className="mx-auto max-w-4xl flex flex-col gap-12">
        <header>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            台灣空氣品質監測
          </h1>
          {latestFetchedAt && (
            <p className="mt-1 text-sm text-zinc-500">
              最後更新：{new Date(latestFetchedAt).toLocaleString("zh-TW")}
            </p>
          )}
        </header>

        <section>
          <h2 className="mb-4 text-lg font-medium text-black dark:text-zinc-50">
            全台目前 AQI 概覽
          </h2>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-100 dark:bg-zinc-900 text-left">
                <tr>
                  <th className="px-4 py-2">縣市</th>
                  <th className="px-4 py-2">測站</th>
                  <th className="px-4 py-2">AQI</th>
                  <th className="px-4 py-2">狀態</th>
                </tr>
              </thead>
              <tbody>
                {overview.map((row) => (
                  <tr
                    key={row.site_name}
                    className="border-t border-zinc-200 dark:border-zinc-800"
                  >
                    <td className="px-4 py-2">{row.county}</td>
                    <td className="px-4 py-2">{row.site_name}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block min-w-10 rounded px-2 py-0.5 text-center font-medium ${aqiColor(
                          row.aqi
                        )}`}
                      >
                        {row.aqi ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                      {row.status || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            告警紀錄（AQI ≥ 100）
          </h2>
          {alerts.length === 0 ? (
            <p className="text-zinc-500">近期無告警紀錄</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-100 dark:bg-zinc-900 text-left">
                  <tr>
                    <th className="px-4 py-2">時間</th>
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
                        {new Date(row.fetched_at).toLocaleString("zh-TW")}
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
