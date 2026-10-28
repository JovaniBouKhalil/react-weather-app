export default function WeatherDetails({ current }) {
  const details = [
    { label: "Feels like", icon: "≈", value: `${Math.round(current.apparent_temperature)}°C` },
    { label: "Humidity", icon: "◉", value: `${Math.round(current.relative_humidity_2m)}%` },
    { label: "Wind speed", icon: "↝", value: `${Math.round(current.wind_speed_10m)} km/h` }
  ];

  return (
    <div className="details-card">
      <div className="section-heading"><h2>The finer details</h2><span className="section-number" aria-hidden="true">02 / NOW</span></div>
      <dl className="weather-details">
        {details.map(detail => (
          <div className="detail-row" key={detail.label}>
            <dt><span className="detail-icon" aria-hidden="true">{detail.icon}</span>{detail.label}</dt>
            <dd>{detail.value}</dd>
          </div>
        ))}
      </dl>
      <p className="details-note">A quick snapshot, wherever your day takes you.</p>
    </div>
  );
}
