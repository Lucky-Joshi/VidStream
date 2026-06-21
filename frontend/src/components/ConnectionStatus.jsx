import { CONNECTION_STATES } from '../utils/constants';

const STATUS_MESSAGES = {
  [CONNECTION_STATES.CONNECTING]: 'Connecting...',
  [CONNECTION_STATES.WAITING]: 'Waiting for your study partner to join...',
  [CONNECTION_STATES.CONNECTED]: 'Connected',
  [CONNECTION_STATES.RECONNECTING]: 'Connection lost. Reconnecting...',
};

export function ConnectionStatus({ state }) {
  const isVisible = state !== CONNECTION_STATES.CONNECTED;

  return (
    <div className={`connection-status ${state}`}>
      <div className="status-indicator">
        {state !== CONNECTION_STATES.CONNECTED && (
          <div className="spinner" />
        )}
        <span>{STATUS_MESSAGES[state]}</span>
      </div>
    </div>
  );
}
