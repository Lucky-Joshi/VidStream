export function VideoGrid({
  remoteVideoRef,
  localVideoRef,
  isSharingScreen,
  isPartnerConnected,
}) {
  return (
    <div className="video-grid">
      <div className="video-container remote-video">
        {isPartnerConnected ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="video-element"
          />
        ) : (
          <div className="video-placeholder">
            <div className="placeholder-avatar">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="placeholder-text">Waiting for partner...</p>
          </div>
        )}
      </div>

      <div className={`video-container local-video ${isSharingScreen ? 'screen-share' : ''}`}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="video-element"
        />
        <span className="video-label">
          {isSharingScreen ? 'Your Screen' : 'You'}
        </span>
      </div>
    </div>
  );
}
