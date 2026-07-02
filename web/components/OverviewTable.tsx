"use client";

import { useMemo, useState } from "react";
import { AqiRecord, aqiColor } from "@/lib/aqi";
import AqiLegend from "./AqiLegend";

export default function OverviewTable({ overview }: { overview: AqiRecord[] }) {
  const [county, setCounty] = useState("全部");

  // 去重的縣市清單，依中文排序
  const counties = useMemo(
    () =>
      Array.from(new Set(overview.map((r) => r.county))).sort((a, b) =>
        a.localeCompare(b, "zh-Hant")
      ),
    [overview]
  );

  const rows =
    county === "全部" ? overview : overview.filter((r) => r.county === county);

  return (
    <div>
      <AqiLegend />
      <div className="mb-3">
        <select
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <option value="全部">全部</option>
          {counties.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
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
            {rows.map((row) => (
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
    </div>
  );
}
