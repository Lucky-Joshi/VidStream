export function Toast({ message, visible }) {
  if (!visible || !message) {
    return null;
  }

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      <div className="toast-message">{message}</div>
    </div>
  );
}
