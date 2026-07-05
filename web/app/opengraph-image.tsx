import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "台灣空氣品質監測";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// OG 圖用到的所有字元（子集），只取這些字讓字型檔盡量小
const SUBSET =
  " -.157AGHINQSVabcdeijlnoprstuvwx·不事件健全勢危即台告品圖天好害常康感敏時普標氣測灣監空站良警質超趨近通非";

// 以「舊版 User-Agent」向 Google Fonts 要 CSS，逼它回 ttf（Satori 不吃 woff2）
async function loadFont(weight: 400 | 800): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@${weight}&text=${encodeURIComponent(
    SUBSET
  )}`;
  const cssRes = await fetch(cssUrl, {
    headers: { "User-Agent": "Mozilla/4.0" },
  });
  const css = await cssRes.text();
  const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error("找不到字型 URL");
  const fontRes = await fetch(url);
  return fontRes.arrayBuffer();
}

// AQI 六色階
const SCALE = [
  { color: "#22c55e", label: "良好" },
  { color: "#facc15", label: "普通" },
  { color: "#f97316", label: "敏感" },
  { color: "#dc2626", label: "不健康" },
  { color: "#7e22ce", label: "非常" },
  { color: "#881337", label: "危害" },
];

// 右上角圓點陣（3 列 × 4 欄）
const DOTS = [
  ["#22c55e", "#22c55e", "#facc15", "#22c55e"],
  ["#facc15", "#f97316", "#facc15", "#22c55e"],
  ["#22c55e", "#facc15", "#22c55e", "#22c55e"],
];

export default async function Image() {
  const [regular, extraBold] = await Promise.all([
    loadFont(400),
    loadFont(800),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          fontFamily: "Noto Sans TC",
          padding: "44px 80px",
          position: "relative",
        }}
      >
        {/* 右上角圓點陣：用 3 個橫向 flex row，避免 CSS grid */}
        <div
          style={{
            position: "absolute",
            top: 44,
            right: 80,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {DOTS.map((row, i) => (
            <div key={i} style={{ display: "flex", marginBottom: 10 }}>
              {row.map((c, j) => (
                <div
                  key={j}
                  style={{
                    display: "flex",
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: c,
                    marginRight: 10,
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* 上半：膠囊 + 主標 + 副標 */}
        <div
          style={{ display: "flex", flexDirection: "column", flex: 1 }}
        >
          {/* 膠囊標籤 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: 999,
              padding: "8px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#22c55e",
                marginRight: 10,
              }}
            />
            <div style={{ display: "flex", color: "#a1a1aa", fontSize: 20 }}>
              台灣 · 即時空氣品質
            </div>
          </div>

          {/* 主標題 */}
          <div
            style={{
              display: "flex",
              color: "#fafafa",
              fontSize: 52,
              fontWeight: 800,
              marginTop: 28,
            }}
          >
            台灣空氣品質監測
          </div>

          {/* 副標 */}
          <div
            style={{
              display: "flex",
              color: "#a1a1aa",
              fontSize: 22,
              marginTop: 18,
            }}
          >
            全台測站即時 AQI · 近 7 天趨勢圖 · 超標事件告警
          </div>
        </div>

        {/* AQI 六色階條 */}
        <div
          style={{ display: "flex", flexDirection: "column", width: "76%" }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 16,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {SCALE.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flex: 1,
                  backgroundColor: s.color,
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", width: "100%", marginTop: 8 }}>
            {SCALE.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flex: 1,
                  justifyContent: "center",
                  color: "#71717a",
                  fontSize: 12,
                }}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* 底部：左下技術棧 + 右下網址 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 28,
          }}
        >
          <div style={{ display: "flex", color: "#52525b", fontSize: 14 }}>
            Next.js · Supabase · Vercel · GitHub Actions
          </div>
          <div style={{ display: "flex", color: "#52525b", fontSize: 14 }}>
            web-one-liard-15.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans TC", data: regular, weight: 400, style: "normal" },
        { name: "Noto Sans TC", data: extraBold, weight: 800, style: "normal" },
      ],
    }
  );
}
