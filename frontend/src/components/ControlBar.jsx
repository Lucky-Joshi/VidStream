export function ControlBar({
  isMicEnabled,
  isCamEnabled,
  isSharingScreen,
  isPartnerConnected,
  onToggleMic,
  onToggleCam,
  onSwitchCamera,
  onStartScreenShare,
  onStopScreenShare,
  onLeaveCall,
}) {
  return (
    <div id="control-bar" className="control-bar">
      <div className="control-group">
        <button
          id="btn-toggle-mic"
          className={`control-btn ${isMicEnabled ? 'active' : 'inactive'}`}
          onClick={onToggleMic}
          title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
          aria-label={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicEnabled ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .87-.16 1.71-.46 2.49" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
          <span className="control-label">{isMicEnabled ? 'Mic' : 'Muted'}</span>
        </button>

        <button
          id="btn-toggle-cam"
          className={`control-btn ${isCamEnabled ? 'active' : 'inactive'}`}
          onClick={onToggleCam}
          onDoubleClick={onSwitchCamera}
          title={isCamEnabled ? 'Turn off camera' : 'Turn on camera'}
          aria-label={isCamEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCamEnabled ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
          <span className="control-label">{isCamEnabled ? 'Cam' : 'Off'}</span>
        </button>

        <button
          id="btn-screen-share"
          className={`control-btn ${isSharingScreen ? 'active sharing' : ''}`}
          onClick={isSharingScreen ? onStopScreenShare : onStartScreenShare}
          title={isSharingScreen ? 'Stop sharing' : 'Share screen'}
          aria-label={isSharingScreen ? 'Stop sharing screen' : 'Share screen'}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span className="control-label">{isSharingScreen ? 'Stop' : 'Share'}</span>
        </button>
      </div>

      <div className="control-divider" />

      <button
        id="btn-leave-call"
        className="control-btn leave-btn"
        onClick={onLeaveCall}
        title="Leave call"
        aria-label="Leave call"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
        <span className="control-label">Leave</span>
      </button>
    </div>
  );
}
