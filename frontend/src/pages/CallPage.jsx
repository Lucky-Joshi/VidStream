import { useEffect } from 'react';
import { useCall } from '../hooks/useCall';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { PermissionPrompt } from '../components/PermissionPrompt';
import { VideoGrid } from '../components/VideoGrid';
import { ControlBar } from '../components/ControlBar';
import { CONNECTION_STATES } from '../utils/constants';

export function CallPage() {
  const call = useCall();

  useEffect(() => {
    call.requestMedia();
  }, []);

  if (call.isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner" />
          <p>Accessing camera and microphone...</p>
        </div>
      </div>
    );
  }

  if (call.permissionError) {
    return (
      <PermissionPrompt
        permissionError={call.permissionError}
        onRetry={call.retryPermissions}
      />
    );
  }

  return (
    <div className="call-container">
      <ConnectionStatus state={call.connectionState} />

      <VideoGrid
        remoteVideoRef={call.remoteVideoRef}
        localVideoRef={call.localVideoRef}
        isSharingScreen={call.isSharingScreen}
        isPartnerConnected={call.partnerId !== null}
      />

      <ControlBar
        isMicEnabled={call.isMicEnabled}
        isCamEnabled={call.isCamEnabled}
        isSharingScreen={call.isSharingScreen}
        isPartnerConnected={call.partnerId !== null}
        onToggleMic={call.toggleMic}
        onToggleCam={call.toggleCam}
        onStartScreenShare={call.startScreenShare}
        onStopScreenShare={call.stopScreenShare}
        onLeaveCall={() => window.location.reload()}
      />
    </div>
  );
}
