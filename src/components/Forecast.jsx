import ForecastCard from "./ForecastCard.jsx";

const labels = ["Today", "Tomorrow", "Next day"];

export default function Forecast({ daily }) {
  return (
    <section className="forecast-section" aria-labelledby="forecast-heading">
      <div className="section-heading">
        <div><p className="eyebrow">PLAN A LITTLE AHEAD</p><h2 id="forecast-heading">On the horizon</h2></div>
        <span className="section-number">3-DAY OUTLOOK</span>
      </div>
      {/* Sessions 13 and 14: map data to reusable cards with stable date keys. */}
      <ul className="forecast-grid">
        {daily.time.map((date, index) => (
          <ForecastCard key={date} date={date} label={labels[index]} code={daily.weather_code[index]}
            high={daily.temperature_2m_max[index]} low={daily.temperature_2m_min[index]} />
        ))}
      </ul>
    </section>
  );
}
