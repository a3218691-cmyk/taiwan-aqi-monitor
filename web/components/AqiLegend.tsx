// AQI 分級色塊圖例
const LEGEND = [
  { label: "0–50 良好", color: "bg-green-500" },
  { label: "51–100 普通", color: "bg-yellow-400" },
  { label: "101–150 對敏感族群不健康", color: "bg-orange-500" },
  { label: "151–200 對所有族群不健康", color: "bg-red-600" },
  { label: "201–300 非常不健康", color: "bg-purple-700" },
  { label: "301+ 危害", color: "bg-rose-900" },
];

export default function AqiLegend() {
  return (
    <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400">
      {LEGEND.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-3 rounded-sm ${item.color}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
