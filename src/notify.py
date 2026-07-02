import os
import requests
from dotenv import load_dotenv

load_dotenv()


def notify_telegram(message):
    """發送Telegram通知；若尚未設定Token/ChatID則略過並印出提示"""
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")

    if not token or not chat_id:
        print("[notify] Telegram 尚未設定，略過通知")
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    resp = requests.post(url, data={"chat_id": chat_id, "text": message}, timeout=15)
    resp.raise_for_status()


def format_alert(exceeded_rows):
    lines = ["空氣品質警示："]
    for site_name, county, aqi, status, pm25, publish_time in exceeded_rows:
        lines.append(f"{county} {site_name}：AQI {aqi}（{status}）")
    return "\n".join(lines)
