import os
import ssl
import requests
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://data.moenv.gov.tw/api/v2/aqx_p_432"
ORANGE_THRESHOLD = 60  # 橘警：對敏感族群不健康 [TEMP-TEST: 原值100，測試完畢需改回]
RED_THRESHOLD = 150     # 紅害：對所有族群不健康


class RelaxedSKIAdapter(requests.adapters.HTTPAdapter):
    """環境部憑證缺少 Subject Key Identifier 擴充欄位，OpenSSL 3.2+ 預設嚴格模式會拒絕。
    這裡只關閉該項嚴格檢查，其餘憑證鏈驗證仍正常進行（不同於整個關閉 SSL 驗證）。"""

    def init_poolmanager(self, *args, **kwargs):
        ctx = ssl.create_default_context()
        ctx.verify_flags &= ~ssl.VERIFY_X509_STRICT
        kwargs["ssl_context"] = ctx
        return super().init_poolmanager(*args, **kwargs)


def fetch_current_aqi():
    """呼叫環境部開放資料平台，取得全台各測站即時AQI"""
    api_key = os.environ["MOENV_API_KEY"]
    session = requests.Session()
    session.mount("https://", RelaxedSKIAdapter())
    resp = session.get(
        API_URL,
        params={"api_key": api_key, "format": "json", "limit": 1000},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def to_row(record):
    def to_number(value):
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    aqi = to_number(record.get("aqi"))
    return (
        record.get("sitename"),
        record.get("county"),
        int(aqi) if aqi is not None else None,
        record.get("status"),
        to_number(record.get("pm2.5")),
        record.get("publishtime"),
    )


def find_exceeded(records, threshold=ORANGE_THRESHOLD):
    """找出AQI超過指定門檻的測站"""
    exceeded = []
    for record in records:
        row = to_row(record)
        aqi = row[2]
        if aqi is not None and aqi >= threshold:
            exceeded.append(row)
    return exceeded
