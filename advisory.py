def build_advisory(crop: str, is_healthy: bool, forecast: dict) -> dict:
    daily = forecast.get("daily", {})
    dates = daily.get("time", [])
    rain = daily.get("precipitation_sum", [])
    temp_max = daily.get("temperature_2m_max", [])
    humidity = daily.get("relative_humidity_2m_mean", [])

    days = []
    for i in range(min(len(dates), 3)):
        days.append({
            "date": dates[i],
            "rain_mm": rain[i] if i < len(rain) else None,
            "temp_max_c": temp_max[i] if i < len(temp_max) else None,
            "humidity_pct": humidity[i] if i < len(humidity) else None,
        })

    total_rain = sum(d["rain_mm"] or 0 for d in days)
    avg_humidity = sum(d["humidity_pct"] or 0 for d in days) / len(days) if days else 0
    hot_day = any((d["temp_max_c"] or 0) >= 35 for d in days)

    recs = []

    # Irrigation
    if total_rain >= 15:
        recs.append(_rec("Irrigation", f"Significant rain expected ({total_rain:.0f}mm over 3 days) — hold off irrigation to avoid waterlogging and nutrient runoff."))
    elif total_rain >= 3:
        recs.append(_rec("Irrigation", f"Light rain expected ({total_rain:.0f}mm) — reduce scheduled irrigation by roughly half."))
    elif hot_day:
        recs.append(_rec("Irrigation", "Hot, dry conditions ahead with no meaningful rain — irrigate on schedule, ideally early morning or evening to reduce evaporation loss."))
    else:
        recs.append(_rec("Irrigation", "No significant rain expected — maintain your normal irrigation schedule."))

    # Fertilizer
    if total_rain >= 15:
        recs.append(_rec("Fertilizer", "Heavy rain forecast — delay fertilizer application; it will wash off and waste input cost."))
    else:
        recs.append(_rec("Fertilizer", "Conditions are stable — this is a reasonable window to apply scheduled fertilizer."))

    # Disease risk
    if not is_healthy:
        if avg_humidity >= 75 or total_rain >= 3:
            recs.append(_rec("Disease Risk", f"High humidity and/or rain forecast for {crop} — favorable conditions for disease spread. Apply the recommended treatment promptly rather than waiting."))
        else:
            recs.append(_rec("Disease Risk", "Drier conditions ahead — still apply the recommended treatment, but spread is less likely to accelerate in the short term."))
    elif avg_humidity >= 80:
        recs.append(_rec("Disease Risk", f"Plant currently looks healthy, but humidity is high over the next few days — monitor {crop} closely, as this is favorable for fungal disease onset."))

    return {
        "crop": crop,
        "forecast_summary": {
            "rain_next_3_days_mm": round(total_rain, 1),
            "avg_humidity_pct": round(avg_humidity, 1),
            "hot_day_ahead": hot_day,
        },
        "daily_forecast": days,
        "recommendations": recs,
    }


def _rec(category: str, advice: str) -> dict:
    return {"category": category, "advice": advice}