import { TrendPoint } from "@/lib/aqi";

function formatHour(hour: string): string {
  // hour is like "2026-07-02T03"
  const [date, h] = hour.split("T");
  const [, month, day] = date.split("-");
  return `${month}/${day} ${h}:00`;
}

export default function TrendChart({ points }: { points: TrendPoint[] }) {
  if (points.length === 0) {
    return <p className="text-zinc-500">尚無歷史資料</p>;
  }

  const width = 800;
  const height = 240;
  const padding = 32;
  const maxAqi = Math.max(100, ...points.map((p) => p.avgAqi)) * 1.1;

  const stepX = (width - padding * 2) / Math.max(points.length - 1, 1);
  const toY = (aqi: number) =>
    height - padding - (aqi / maxAqi) * (height - padding * 2);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${padding + i * stepX} ${toY(p.avgAqi)}`)
    .join(" ");

  const tickEvery = Math.ceil(points.length / 6);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="currentColor"
        className="text-zinc-300 dark:text-zinc-700"
      />
      <path d={linePath} fill="none" stroke="#f97316" strokeWidth={2} />
      {points.map((p, i) => (
        <circle
          key={`dot-${p.hour}`}
          cx={padding + i * stepX}
          cy={toY(p.avgAqi)}
          r={3}
          fill="#f97316"
        />
      ))}
      {points.map((p, i) =>
        i % tickEvery === 0 ? (
          <text
            key={p.hour}
            x={padding + i * stepX}
            y={height - padding + 16}
            fontSize={10}
            textAnchor="middle"
            className="fill-zinc-500"
          >
            {formatHour(p.hour)}
          </text>
        ) : null
      )}
    </svg>
  );
}
