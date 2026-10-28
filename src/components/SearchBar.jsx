import { useState } from "react";

const cities = ["Beirut", "London", "Tokyo"];

export default function SearchBar({ onSearch, loading }) {
  // Sessions 14 and 15: a controlled input keeps its draft and validation local.
  const [query, setQuery] = useState("");
  const [validationError, setValidationError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const city = query.trim();
    if (city.length < 2) {
      setValidationError("Please enter a city name with at least two characters.");
      return;
    }
    setValidationError("");
    onSearch(city);
  }

  function selectCity(city) {
    setQuery(city);
    setValidationError("");
    onSearch(city);
  }

  return (
    <section className="search-panel" aria-labelledby="search-heading">
      <div className="section-heading">
        <h2 id="search-heading">Where are we looking?</h2>
        <span className="section-number" aria-hidden="true">01 / SEARCH</span>
      </div>
      {/* A form handles the button and Enter; no page reload or manual listeners. */}
      <form role="search" onSubmit={handleSubmit} noValidate>
        <label htmlFor="city-input">City name</label>
        <div className="search-row">
          <input id="city-input" name="city" type="search" placeholder="e.g. Beirut" maxLength={100} required
            value={query} disabled={loading} aria-invalid={Boolean(validationError)}
            aria-describedby={validationError ? "city-error search-help" : "search-help"}
            onChange={event => { setQuery(event.target.value); setValidationError(""); }} />
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? "Checking weather…" : "Check weather"} <span aria-hidden="true">↗</span>
          </button>
        </div>
        {validationError && <p id="city-error" className="field-error" role="alert">{validationError}</p>}
        <p id="search-help" className="help-text">Search a city, then check the matched region below.</p>
      </form>
      <div className="suggestions">
        <span>Somewhere to start</span>
        {cities.map(city => (
          <button key={city} type="button" className="city-button" disabled={loading} onClick={() => selectCity(city)}>
            {city} <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </section>
  );
}
