import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import SearchBar from "./components/SearchBar.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import ErrorMessage from "./components/ErrorMessage.jsx";
import EmptyState from "./components/EmptyState.jsx";
import WeatherCard from "./components/WeatherCard.jsx";
import WeatherDetails from "./components/WeatherDetails.jsx";
import Forecast from "./components/Forecast.jsx";
import Footer from "./components/Footer.jsx";
import { loadWeather, friendlyError } from "./services/weather.js";

export default function App() {
  // Sessions 14 and 15: shared request state belongs in the siblings' closest parent.
  // Draft input stays inside SearchBar; request changes only on a valid submission.
  const [request, setRequest] = useState(null);
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const loading = status === "loading";

  useEffect(() => {
    if (!request) return;

    // Session 15: each effect owns its cleanup, including StrictMode's extra run.
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => {
      if (!active) return;
      active = false;
      controller.abort();
      setError("The weather service took too long to respond. Please try again.");
      setStatus("error");
    }, 15000);

    // An effect itself is synchronous; define and call the async function inside it.
    async function fetchWeather() {
      try {
        const data = await loadWeather(request.city, controller.signal);
        if (!active) return;
        setWeather(data);
        setStatus("success");
      } catch (failure) {
        if (!active) return;
        setError(friendlyError(failure, request.city));
        setStatus("error");
      } finally {
        clearTimeout(timeout);
      }
    }

    fetchWeather();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
    // Only a submitted request triggers fetching, never each input keystroke.
  }, [request]);

  function handleSearch(city) {
    if (loading) return;
    setError("");
    setWeather(null);
    setStatus("loading");
    // A new object also lets retry and repeated searches fetch the same city again.
    setRequest({ city });
  }

  return (
    <>
      <Header />
      <main className="page-width">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">YOUR DAILY WEATHER, SIMPLIFIED</p>
          <h1 id="page-title">A little clarity<br />for your day<span className="accent">.</span></h1>
          <p className="intro-copy">Around the corner or across the world.<br />Find out what the sky has in store.</p>
        </section>
        <SearchBar onSearch={handleSearch} loading={loading} />
        {/* Session 14: state decides which elements exist, without DOM selectors. */}
        <div role="status" aria-live="polite" aria-atomic="true">
          {status === "idle" && <p className="feedback">Ready when you are. Search for a city to get started.</p>}
          {loading && <LoadingSpinner city={request.city} />}
          {status === "success" && <p className="feedback" data-state="success">Weather loaded for {weather.location.name}. All times are local to the city.</p>}
        </div>
        {status === "error" && <ErrorMessage message={error} onRetry={() => handleSearch(request.city)} />}
        {(status === "idle" || status === "error") && <EmptyState />}
        <div aria-busy={loading}>
          {status === "success" && weather && (
            <>
              <section className="weather-layout" aria-label="Current weather">
                <WeatherCard location={weather.location} current={weather.current} />
                <WeatherDetails current={weather.current} />
              </section>
              <Forecast daily={weather.daily} />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
