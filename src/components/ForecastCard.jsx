import { getCondition } from "../utils/conditions.js";

export default function ForecastCard({ date, label, code, high, low }) {
  const condition = getCondition(code);
  return (
    <li className="forecast-card">
      <h3>{label}</h3>
      <p className="forecast-date"><time dateTime={date}>{date}</time></p>
      <span className="forecast-icon" role="img" aria-label={condition.description}>{condition.icon}</span>
      <p className="forecast-description">{condition.description}</p>
      <p className="forecast-temperatures">High {Math.round(high)}° / Low {Math.round(low)}°</p>
    </li>
  );
}
