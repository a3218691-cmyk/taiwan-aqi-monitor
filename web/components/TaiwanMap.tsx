"use client";

import { useMemo, useState } from "react";
import { AqiRecord, aqiHex } from "@/lib/aqi";
import { TW_COUNTIES, TW_OUTLYING, TW_VIEWBOX } from "@/lib/taiwanCounties";

// AQI 資料的縣市名正規化（台→臺），與地圖的現制縣市名對齊
function norm(name: string) {
  return name.replace("台", "臺");
}

type CountyStat = { max: number; site: string };

export default function TaiwanMap({ overview }: { overview: AqiRecord[] }) {
  // 每個縣市取「最高 AQI」與對應的最糟測站
  const stats = useMemo(() => {
    const m = new Map<string, CountyStat>();
    for (const r of overview) {
      if (r.aqi == null) continue;
      const c = norm(r.county);
      const cur = m.get(c);
      if (!cur || r.aqi > cur.max) m.set(c, { max: r.aqi, site: r.site_name });
    }
    return m;
  }, [overview]);

  // 全台最糟縣市，當沒有 hover 時的預設顯示
  const worst = useMemo(() => {
    let w: { name: string; max: number; site: string } | null = null;
    for (const [name, st] of stats)
      if (!w || st.max > w.max) w = { name, max: st.max, site: st.site };
    return w;
  }, [stats]);

  const [active, setActive] = useState<string | null>(null);
  const shownName = active ?? worst?.name ?? null;
  const shown = shownName ? stats.get(shownName) : null;

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* 主地圖（海底色 + 縣市著色 + 標籤） */}
        <svg
          viewBox={TW_VIEWBOX}
          className="mx-auto h-auto w-full max-w-[280px] rounded-md"
          role="img"
          aria-label="全台各縣市空氣品質地圖"
        >
          <rect
            x={0}
            y={0}
            width="100%"
            height="100%"
            className="fill-slate-200 dark:fill-slate-800"
          />
          {TW_COUNTIES.map((c) => {
            const st = stats.get(c.name);
            const isActive = active === c.name;
            return (
              <path
                key={c.name}
                d={c.d}
                fill={aqiHex(st ? st.max : null)}
                stroke={isActive ? "#111" : "#fff"}
                strokeWidth={isActive ? 1.5 : 0.5}
                fillRule="evenodd"
                className="cursor-pointer transition-opacity hover:opacity-75"
                onMouseEnter={() => setActive(c.name)}
                onMouseLeave={() => setActive(null)}
              />
            );
          })}
          {TW_COUNTIES.map((c) =>
            c.label ? (
              <text
                key={`${c.name}-label`}
                x={c.cx}
                y={c.cy}
                fontSize={12}
                fontWeight={600}
                textAnchor="middle"
                dominantBaseline="middle"
                paintOrder="stroke"
                stroke="#ffffffcc"
                strokeWidth={2.4}
                className="pointer-events-none fill-zinc-900"
              >
                {c.label}
              </text>
            ) : null
          )}
        </svg>

        {/* 右側：詳情 + 外島 */}
        <div className="flex flex-col gap-3 sm:w-44">
          <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-900">
            {shown && shownName ? (
              <>
                <p className="text-xs text-zinc-400">{active ? "縣市" : "全台最高"}</p>
                <p className="font-medium text-black dark:text-zinc-50">{shownName}</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  最高 AQI{" "}
                  <span
                    className="rounded px-1.5 py-0.5 font-semibold text-white"
                    style={{ backgroundColor: aqiHex(shown.max) }}
                  >
                    {shown.max}
                  </span>
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{shown.site}</p>
              </>
            ) : (
              <p className="text-sm text-zinc-400">滑鼠移到縣市看細節</p>
            )}
          </div>

          {/* 外島小方塊 */}
          <div>
            <p className="mb-1 text-xs text-zinc-400">外島</p>
            <div className="flex gap-2">
              {TW_OUTLYING.map((name) => {
                const st = stats.get(norm(name));
                return (
                  <button
                    key={name}
                    type="button"
                    onMouseEnter={() => setActive(norm(name))}
                    onMouseLeave={() => setActive(null)}
                    className="flex-1 rounded-md px-2 py-2 text-center text-xs font-medium text-white"
                    style={{ backgroundColor: aqiHex(st ? st.max : null) }}
                  >
                    <div>{name.replace("縣", "")}</div>
                    <div>{st ? st.max : "-"}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
