from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from db import fetch_history

CHART_PATH = Path(__file__).resolve().parent.parent / "charts" / "trend.png"


def plot_trend(days=7):
    rows = fetch_history(days)
    if not rows:
        print("[plot_trend] 尚無歷史資料可繪圖")
        return

    timestamps = [row[0] for row in rows]
    avg_aqi = [row[1] for row in rows]

    plt.figure(figsize=(10, 4))
    plt.plot(timestamps, avg_aqi, marker="o")
    plt.xticks(rotation=45, ha="right", fontsize=6)
    plt.ylabel("Average AQI")
    plt.title(f"Taiwan Average AQI Trend (Last {days} Days)")
    plt.tight_layout()
    plt.savefig(CHART_PATH)
    plt.close()
    print(f"[plot_trend] 已輸出趨勢圖: {CHART_PATH}")
