# 台灣空氣品質儀表板(前端)

台灣空氣品質監控系統的前端儀表板,把後端累積在 Supabase 的 AQI 資料視覺化呈現。

**線上網址:** https://web-one-liard-15.vercel.app

後端資料抓取、告警與自動化排程請見[專案根目錄 README](../README.md)。

## 功能

- **全台 AQI 概覽**:最新一輪所有測站的 AQI 與狀態,可依縣市篩選
- **AQI 分級色塊圖例**:六段分級(良好 → 危害)顏色對照
- **摘要卡片**:全台平均 AQI、橘警站數、目前最糟測站
- **近 7 天趨勢圖**:全台平均 AQI 折線圖,純手刻 SVG,含 Y 軸刻度
- **告警事件**:測站跨越 AQI 50 門檻的時刻(rising edge,不重複洗版)
- **深色模式**:跟隨系統設定自動切換

## 技術棧

- [Next.js](https://nextjs.org)(App Router)+ TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [Supabase](https://supabase.com) 作為資料來源(`@supabase/supabase-js`)
- 趨勢圖為自畫 SVG,未使用任何圖表套件
- 部署於 [Vercel](https://vercel.com)

## 本地啟動

```bash
npm install
npm run dev
```

啟動後開 [http://localhost:3000](http://localhost:3000)。

## 環境變數

在 `web/` 底下建立 `.env.local`,填入 Supabase 專案的連線資訊:

| 變數 | 說明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |

資料表為 `aqi_records`,由後端 Python 程式寫入(見根目錄 README)。

## 部署

**目前未接 GitHub 自動部署:`git push` 只會更新程式碼,不會讓網站上線。** 改完前端要手動在 `web/` 底下跑一次 CLI 部署到 production:

```bash
vercel --prod
```

頁面設定 `revalidate = 600`(10 分鐘),資料會定期重新驗證,不需每次改動都重新部署。
