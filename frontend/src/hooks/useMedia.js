import { useState, useRef, useCallback, useEffect } from 'react';

export function useMedia() {
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCamEnabled, setIsCamEnabled] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const localVideoRef = useRef(null);

  const requestMedia = useCallback(async () => {
    try {
      setIsLoading(true);
      setPermissionError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      setIsMicEnabled(true);
      setIsCamEnabled(true);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Camera and microphone access denied. Please allow permissions to use the app.');
      } else if (err.name === 'NotFoundError') {
        setPermissionError('No camera or microphone found on your device.');
      } else {
        setPermissionError(`Failed to access media: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleMic = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleCam = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      setScreenStream(stream);
      setIsSharingScreen(true);
      return stream;
    } catch (err) {
      setPermissionError(`Screen share failed: ${err.message}`);
      return null;
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    setIsSharingScreen(false);
  }, [screenStream]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
    };
  });

  const retryPermissions = useCallback(() => {
    setPermissionError(null);
    requestMedia();
  }, [requestMedia]);

  return {
    localStream,
    screenStream,
    isMicEnabled,
    isCamEnabled,
    isSharingScreen,
    permissionError,
    isLoading,
    localVideoRef,
    requestMedia,
    toggleMic,
    toggleCam,
    startScreenShare,
    stopScreenShare,
    retryPermissions,
  };
}
