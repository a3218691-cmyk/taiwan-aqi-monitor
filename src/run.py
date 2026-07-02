from fetch_aqi import fetch_current_aqi, to_row, find_exceeded, ORANGE_THRESHOLD
from db import insert_records
from notify import notify_telegram, format_alert
from plot_trend import plot_trend


def main():
    records = fetch_current_aqi()
    print(f"抓取到 {len(records)} 筆測站資料")

    rows = [to_row(r) for r in records]
    insert_records(rows)
    print("已存入資料庫")

    exceeded = find_exceeded(records, threshold=ORANGE_THRESHOLD)
    if exceeded:
        notify_telegram(format_alert(exceeded))
        print(f"{len(exceeded)} 個測站超標，已發送通知")
    else:
        print("目前無測站超標")

    plot_trend(days=7)


if __name__ == "__main__":
    main()
