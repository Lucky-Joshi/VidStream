export function VideoGrid({
  remoteVideoRef,
  localVideoRef,
  isSharingScreen,
  isPartnerConnected,
  connectionState,
}) {
  return (
    <div id="video-grid" className="video-grid">
      <div className="video-container remote-video">
        {isPartnerConnected ? (
          <video
            id="remote-video-element"
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="video-element"
          />
        ) : (
          <div className="video-placeholder">
            <div className="placeholder-avatar">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <p className="placeholder-text">Waiting for your study partner...</p>
            <p className="placeholder-hint">
              Share this app link with your partner to get started
            </p>
          </div>
        )}
        {isPartnerConnected && (
          <span className="video-label partner-label">Partner</span>
        )}
      </div>

      <div
        className={`video-container local-video ${
          isSharingScreen ? 'screen-sharing-active' : ''
        }`}
      >
        <video
          id="local-video-element"
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="video-element"
        />
        <span className="video-label">
          {isSharingScreen ? '📺 Sharing Screen' : 'You'}
        </span>
      </div>
    </div>
  );
}
