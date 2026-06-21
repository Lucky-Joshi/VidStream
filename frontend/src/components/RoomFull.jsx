export function RoomFull() {
  return (
    <div id="room-full-screen" className="permission-prompt">
      <div className="permission-card">
        <div className="permission-icon room-full-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h2>Room is Full</h2>
        <p className="permission-message">
          The study room already has two participants. Please wait for someone to leave and try again.
        </p>
        <button
          id="btn-refresh-room"
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  );
}
