// The parent supplies the message and action, so this component can be reused.
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="feedback" data-state="error" role="alert">
      <p>{message}</p>
      <button className="button button-secondary" type="button" onClick={onRetry}>Try again <span aria-hidden="true">↗</span></button>
    </div>
  );
}
