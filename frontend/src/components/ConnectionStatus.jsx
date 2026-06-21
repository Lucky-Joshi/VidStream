import { CONNECTION_STATES } from '../utils/constants';

const STATUS_CONFIG = {
  [CONNECTION_STATES.CONNECTING]: {
    message: 'Connecting to server...',
    icon: '🔗',
  },
  [CONNECTION_STATES.WAITING]: {
    message: 'Waiting for your study partner to join...',
    icon: '⏳',
  },
  [CONNECTION_STATES.CONNECTED]: {
    message: 'Connected',
    icon: '✓',
  },
  [CONNECTION_STATES.RECONNECTING]: {
    message: 'Connection lost. Reconnecting...',
    icon: '⚠',
  },
};

export function ConnectionStatus({ state }) {
  const config = STATUS_CONFIG[state] || STATUS_CONFIG[CONNECTION_STATES.CONNECTING];
  const isActive = state !== CONNECTION_STATES.CONNECTED;

  return (
    <div
      id="connection-status"
      className={`connection-status ${state}`}
      role="status"
      aria-live="polite"
    >
      <div className="status-indicator">
        {isActive && <div className="status-pulse" />}
        <span className="status-icon">{config.icon}</span>
        <span className="status-text">{config.message}</span>
      </div>
    </div>
  );
}
