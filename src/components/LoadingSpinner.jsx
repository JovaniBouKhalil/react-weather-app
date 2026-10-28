export default function LoadingSpinner({ city }) {
  return (
    <div className="feedback" data-state="loading">
      <span className="loading-dot" aria-hidden="true" />
      <p>Looking up weather for {city}…</p>
    </div>
  );
}
