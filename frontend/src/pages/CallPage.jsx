import { useEffect } from 'react';
import { useCall } from '../hooks/useCall';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { PermissionPrompt } from '../components/PermissionPrompt';
import { RoomFull } from '../components/RoomFull';
import { VideoGrid } from '../components/VideoGrid';
import { ControlBar } from '../components/ControlBar';

export function CallPage() {
  const call = useCall();

  useEffect(() => {
    call.requestMedia();
  }, []);

  if (call.isLoading) {
    return (
      <div id="loading-screen" className="loading-screen">
        <div className="loading-content">
          <div className="loading-brand">
            <h1 className="loading-title">VidChat</h1>
            <p className="loading-subtitle">Pair Programming Made Simple</p>
          </div>
          <div className="spinner" />
          <p className="loading-message">Accessing camera and microphone...</p>
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

  if (call.isRoomFull) {
    return <RoomFull />;
  }

  return (
    <div id="call-container" className="call-container">
      <ConnectionStatus state={call.connectionState} />

      <VideoGrid
        remoteVideoRef={call.remoteVideoRef}
        localVideoRef={call.localVideoRef}
        isSharingScreen={call.isSharingScreen}
        isPartnerConnected={call.partnerId !== null}
        connectionState={call.connectionState}
      />

      <ControlBar
        isMicEnabled={call.isMicEnabled}
        isCamEnabled={call.isCamEnabled}
        isSharingScreen={call.isSharingScreen}
        isPartnerConnected={call.partnerId !== null}
        isScreenShareSupported={call.isScreenShareSupported}
        onToggleMic={call.toggleMic}
        onToggleCam={call.toggleCam}
        onStartScreenShare={call.startScreenShare}
        onStopScreenShare={call.stopScreenShare}
        onLeaveCall={call.leaveCall}
      />
    </div>
  );
}
