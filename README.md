# 台灣空氣品質監控與告警系統

自動抓取環境部開放資料平台的全台空氣品質即時資料，累積成歷史資料庫、產出趨勢圖，並在空氣品質達到「橘警」等級以上時透過 Telegram 主動通知。整套流程透過 GitHub Actions 排程自動執行，不需要手動操作。

## 專案目的

想練習「資料抓取 → 儲存 → 分析 → 自動化告警」這條完整的資料工程流程，選擇空氣品質作為題材，因為環境部有提供正式的開放資料 API，資料公開合法，不需要爬蟲繞過任何限制。

## 架構

```
GitHub Actions (每小時排程)
    │
    ▼
src/run.py
    ├─ fetch_aqi.py   抓取全台測站即時 AQI（環境部開放資料 API）
    ├─ db.py          存入 SQLite，累積歷史資料
    ├─ notify.py      AQI ≥ 100（橘警）時發送 Telegram 通知
    └─ plot_trend.py  產出近 7 天全台平均 AQI 趨勢圖
    │
    ▼
data/aqi.db、charts/trend.png 自動 commit 回 repo
```

## 技術重點

- **開放資料 API**：串接[環境部環境資料開放平台](https://data.moenv.gov.tw/)的空氣品質指標(AQI)資料集
- **憑證問題排查**：環境部網域憑證缺少 Subject Key Identifier 擴充欄位，在 OpenSSL 3.2+ 的預設嚴格模式下會被拒絕連線。解法不是整個關閉 SSL 驗證，而是透過自訂 `SSLContext` 精準關閉 `VERIFY_X509_STRICT` 這一項檢查，其餘憑證鏈驗證仍正常運作（見 [`src/fetch_aqi.py`](src/fetch_aqi.py)）
- **歷史資料**：SQLite 儲存每次抓取結果，供趨勢分析使用
- **自動化排程**：GitHub Actions cron 每小時觸發，執行完成後自動將更新的資料庫與圖表 commit 回 repo
- **告警通知**：透過 Telegram Bot API 推播，Token/Chat ID 皆以 GitHub Secrets 管理，不寫死在程式碼中

## 環境需求

```bash
pip install -r requirements.txt
```

需在 `.env`（本地測試）或 GitHub Secrets（正式排程）設定：

| 變數 | 說明 |
|---|---|
| `MOENV_API_KEY` | 環境部開放資料平台 API Key（[申請頁面](https://data.moenv.gov.tw/)） |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token |
| `TELEGRAM_CHAT_ID` | 接收通知的 Telegram Chat ID |

## 執行

```bash
python src/run.py
```

## 免責聲明

資料來源為環境部公開開放資料，僅供個人學習與作品集展示使用。
