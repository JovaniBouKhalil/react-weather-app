// Session 11: geocode a city first, then request weather for its coordinates.
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

async function getJSON(url, signal) {
  // fetch also resolves on HTTP errors, so check the status before reading JSON.
  // App's effect catches failures; its cleanup can abort both sequential requests.
  const response = await fetch(url, { signal });
  if (response.status === 429) throw new Error("rate-limit");
  if (response.status >= 500) throw new Error("server-error");
  if (response.status !== 200) throw new Error("request-error");
  return await response.json();
}

export async function loadWeather(city, signal) {
  // URLSearchParams safely encodes spaces, accents, and punctuation in city names.
  const query = new URLSearchParams({ name: city, count: 1, language: "en", format: "json" });
  const geo = await getJSON(`${GEO_URL}?${query}`, signal);
  if (!geo.results?.length) throw new Error("not-found");

  const location = geo.results[0];
  if (typeof location.latitude !== "number" || typeof location.longitude !== "number" || !location.name) {
    throw new Error("incomplete-data");
  }

  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: 3,
    temperature_unit: "celsius",
    wind_speed_unit: "kmh"
  });
  const data = await getJSON(`${WEATHER_URL}?${params}`, signal);

  // Do not turn missing/null values into misleading zero-degree readings.
  const current = data.current;
  if (!current || typeof current.time !== "string" || current.time.length < 16 ||
      !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.apparent_temperature) ||
      !Number.isFinite(current.relative_humidity_2m) || !Number.isFinite(current.wind_speed_10m) ||
      !Number.isFinite(current.weather_code) || ![0, 1].includes(current.is_day)) {
    throw new Error("incomplete-data");
  }

  if (data.daily?.time?.length !== 3) throw new Error("incomplete-data");
  data.daily.time.forEach((day, i) => {
    if (typeof day !== "string" || !Number.isFinite(data.daily.temperature_2m_max?.[i]) ||
        !Number.isFinite(data.daily.temperature_2m_min?.[i]) || !Number.isFinite(data.daily.weather_code?.[i])) {
      throw new Error("incomplete-data");
    }
  });
  return { location, current, daily: data.daily };
}

export function friendlyError(error, city) {
  if (error.message === "not-found") return `We couldn't find “${city}”. Check the spelling or try a nearby city.`;
  if (error.message === "rate-limit") return "Too many requests. Please wait a minute, then try again.";
  if (error.message === "server-error") return "The weather service is temporarily unavailable. Please try again shortly.";
  if (error.message === "request-error") return "The weather service couldn't complete that request. Please try again.";
  if (error.message === "incomplete-data") return "The weather service returned incomplete data. Please try again shortly.";
  return "We couldn't load the weather. Check your internet connection and try again.";
}
