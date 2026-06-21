export function PermissionPrompt({ permissionError, onRetry }) {
  return (
    <div className="permission-prompt">
      <div className="permission-card">
        <div className="permission-icon">!</div>
        <h2>Permissions Required</h2>
        <p className="permission-message">{permissionError}</p>
        <button className="btn btn-primary" onClick={onRetry}>
          Allow Access
        </button>
      </div>
    </div>
  );
}
