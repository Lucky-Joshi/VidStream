import { useState, useRef, useCallback, useEffect } from 'react';
import { MEDIA_CONSTRAINTS, SCREEN_SHARE_CONSTRAINTS } from '../utils/constants';

export function useMedia() {
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCamEnabled, setIsCamEnabled] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScreenShareSupported, setIsScreenShareSupported] = useState(true);
  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const localStreamRef = useRef(null);

  // Check if screen sharing is supported on this device
  useEffect(() => {
    const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
    setIsScreenShareSupported(supported);
  }, []);

  const requestMedia = useCallback(async () => {
    try {
      setIsLoading(true);
      setPermissionError(null);

      console.log('[MEDIA] Requesting camera and microphone...');
      const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);

      console.log('[MEDIA] LOCAL STREAM ACQUIRED - tracks:', stream.getTracks().length);
      setLocalStream(stream);
      setIsMicEnabled(true);
      setIsCamEnabled(true);

      if (localVideoRef.current) {
        console.log('[MEDIA] Attaching local stream to video element');
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError(
          'Camera and microphone access was denied. Please allow permissions in your browser settings and try again.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError(
          'No camera or microphone found. Please connect a device and try again.'
        );
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPermissionError(
          'Your camera or microphone is already in use by another application.'
        );
      } else {
        setPermissionError(`Failed to access media devices: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleMic = useCallback(() => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicEnabled(audioTrack.enabled);
    }
  }, [localStream]);

  const toggleCam = useCallback(() => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCamEnabled(videoTrack.enabled);
    }
  }, [localStream]);

  const startScreenShare = useCallback(async () => {
    try {
      // Check if getDisplayMedia is supported (not available on mobile devices)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        setPermissionError(
          'Screen sharing is not supported on this device. It\'s only available on desktop browsers (Chrome, Firefox, Safari, Edge).'
        );
        return null;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia(SCREEN_SHARE_CONSTRAINTS);

      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setScreenStream(null);
        setIsSharingScreen(false);
        screenStreamRef.current = null;
      });

      screenStreamRef.current = stream;
      setScreenStream(stream);
      setIsSharingScreen(true);
      return stream;
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
        setPermissionError(`Screen sharing failed: ${err.message}`);
      }
      return null;
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    const stream = screenStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setScreenStream(null);
    setIsSharingScreen(false);
  }, []);

  const retryPermissions = useCallback(() => {
    setPermissionError(null);
    requestMedia();
  }, [requestMedia]);

  const stopAllMedia = useCallback(() => {
    const currentLocalStream = localStreamRef.current;
    if (currentLocalStream) {
      currentLocalStream.getTracks().forEach((track) => track.stop());
    }

    const currentScreenStream = screenStreamRef.current;
    if (currentScreenStream) {
      currentScreenStream.getTracks().forEach((track) => track.stop());
    }

    localStreamRef.current = null;
    screenStreamRef.current = null;
    setLocalStream(null);
    setScreenStream(null);
    setIsSharingScreen(false);
    setIsMicEnabled(false);
    setIsCamEnabled(false);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    localStreamRef.current = localStream;
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    localStream,
    screenStream,
    isMicEnabled,
    isCamEnabled,
    isSharingScreen,
    permissionError,
    isLoading,
    isScreenShareSupported,
    localVideoRef,
    requestMedia,
    toggleMic,
    toggleCam,
    startScreenShare,
    stopScreenShare,
    stopAllMedia,
    retryPermissions,
  };
}
