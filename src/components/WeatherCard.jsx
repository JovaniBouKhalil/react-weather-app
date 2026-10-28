import { getCondition } from "../utils/conditions.js";

export default function WeatherCard({ location, current }) {
  // Session 13: props are read-only; derive display values instead of extra state.
  const condition = getCondition(current.weather_code, current.is_day);
  const region = location.admin1 && location.admin1 !== location.name
    ? [location.admin1, location.country].filter(Boolean).join(", ") : location.country;

  return (
    <div className="current-card">
      <div className="current-card-top">
        <p className="eyebrow">CURRENT CONDITIONS</p>
        <span className="day-pill">{current.is_day === 0 ? "NIGHTTIME" : "DAYTIME"}</span>
      </div>
      <h2 className="location-name">{location.name}</h2>
      <p className="location-region">{region}</p>
      <div className="temperature-row">
        <p className="temperature">{Math.round(current.temperature_2m)}°C</p>
        <span className="weather-icon" role="img" aria-label={condition.description}>{condition.icon}</span>
      </div>
      <p className="weather-description">{condition.description}</p>
      <div className="observation-row">
        <span className="live-label">● LIVE WEATHER</span>
        {/* The API gives city-local time; don't convert it to the browser's timezone. */}
        <p>Updated <time dateTime={current.time}>{current.time.replace("T", " · ")}</time> · city local time</p>
      </div>
    </div>
  );
}
