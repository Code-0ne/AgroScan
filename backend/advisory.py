def build_advisory(crop: str, is_healthy: bool, forecast: dict) -> dict:
    daily = forecast.get("daily", {})
    dates = daily.get("time", [])
    rain = daily.get("precipitation_sum", [])
    temp_max = daily.get("temperature_2m_max", [])
    humidity = daily.get("relative_humidity_2m_mean", [])

    days = []
    for i in range(min(len(dates), 3)):
        days.append(
            {
                "date": dates[i],
                "rain_mm": rain[i] if i < len(rain) else None,
                "temp_max_c": temp_max[i] if i < len(temp_max) else None,
                "humidity_pct": humidity[i] if i < len(humidity) else None,
            }
        )

    rain_next_3_days = sum(d["rain_mm"] or 0 for d in days)
    avg_humidity = sum(d["humidity_pct"] or 0 for d in days) / len(days) if days else 0
    hot_day_ahead = any((d["temp_max_c"] or 0) >= 35 for d in days)

    recommendations = []

    # --- Irrigation ---
    if rain_next_3_days >= 15:
        recommendations.append(
            {
                "category": "Irrigation",
                "advice": f"Significant rain expected ({rain_next_3_days:.0f}mm over the next 3 days) — hold off irrigation to avoid waterlogging and nutrient runoff.",
            }
        )
    elif rain_next_3_days >= 3:
        recommendations.append(
            {
                "category": "Irrigation",
                "advice": f"Light rain expected ({rain_next_3_days:.0f}mm) — reduce scheduled irrigation by roughly half.",
            }
        )
    elif hot_day_ahead:
        recommendations.append(
            {
                "category": "Irrigation",
                "advice": "Hot, dry conditions ahead with no meaningful rain — irrigate on schedule, ideally early morning or evening to reduce evaporation loss.",
            }
        )
    else:
        recommendations.append(
            {
                "category": "Irrigation",
                "advice": "No significant rain expected — maintain your normal irrigation schedule.",
            }
        )

    # --- Fertilizer ---
    if rain_next_3_days >= 15:
        recommendations.append(
            {
                "category": "Fertilizer",
                "advice": "Heavy rain forecast — delay fertilizer application; it will wash off and waste input cost.",
            }
        )
    else:
        recommendations.append(
            {
                "category": "Fertilizer",
                "advice": "Conditions are stable — this is a reasonable window to apply scheduled fertilizer.",
            }
        )

    # --- Disease / spray risk ---
    if not is_healthy:
        if avg_humidity >= 75 or rain_next_3_days >= 3:
            recommendations.append(
                {
                    "category": "Disease Risk",
                    "advice": f"High humidity and/or rain forecast for {crop} — favorable conditions for disease spread. Apply the recommended treatment promptly rather than waiting.",
                }
            )
        else:
            recommendations.append(
                {
                    "category": "Disease Risk",
                    "advice": "Drier conditions ahead — still apply the recommended treatment, but spread is less likely to accelerate in the short term.",
                }
            )
    else:
        if avg_humidity >= 80:
            recommendations.append(
                {
                    "category": "Disease Risk",
                    "advice": f"Plant currently looks healthy, but humidity is high over the next few days — monitor {crop} closely, as this is favorable for fungal disease onset.",
                }
            )

    return {
        "crop": crop,
        "forecast_summary": {
            "rain_next_3_days_mm": round(rain_next_3_days, 1),
            "avg_humidity_pct": round(avg_humidity, 1),
            "hot_day_ahead": hot_day_ahead,
        },
        "daily_forecast": days,
        "recommendations": recommendations,
    }