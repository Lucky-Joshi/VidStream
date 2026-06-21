export function ControlBar({
  isMicEnabled,
  isCamEnabled,
  isSharingScreen,
  isPartnerConnected,
  onToggleMic,
  onToggleCam,
  onStartScreenShare,
  onStopScreenShare,
  onLeaveCall,
}) {
  return (
    <div className="control-bar">
      <div className="control-group">
        <button
          className={`control-btn ${isMicEnabled ? 'active' : 'inactive'}`}
          onClick={onToggleMic}
          title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicEnabled ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
              <path d="M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M19 10v2a7 7 0 0 1-3.06 5.65" />
              <path d="M12 19v4" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        <button
          className={`control-btn ${isCamEnabled ? 'active' : 'inactive'}`}
          onClick={onToggleCam}
          title={isCamEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCamEnabled ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l3-3h6l3 3h3a2 2 0 0 1 2 2v11a2 2 0 0 1-.18.78" />
            </svg>
          )}
        </button>

        <button
          className={`control-btn ${isSharingScreen ? 'active sharing' : 'inactive'}`}
          onClick={isSharingScreen ? onStopScreenShare : onStartScreenShare}
          title={isSharingScreen ? 'Stop sharing screen' : 'Share screen'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </button>
      </div>

      <button
        className="control-btn leave-btn"
        onClick={onLeaveCall}
        title="Leave call"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
        </svg>
      </button>
    </div>
  );
}
