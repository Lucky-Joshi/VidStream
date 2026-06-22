import { useState, useRef, useCallback, useEffect } from 'react';
import { MEDIA_CONSTRAINTS } from '../utils/constants';

const SCREEN_SHARE_UNSUPPORTED_MESSAGE =
  'Screen sharing is not supported on this browser/device. Use desktop Chrome or Edge for best support.';

export function useMedia() {
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCamEnabled, setIsCamEnabled] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isCameraViewMode, setIsCameraViewMode] = useState(false);
  const [screenShareMessage, setScreenShareMessage] = useState('');
  const [permissionError, setPermissionError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScreenShareSupported, setIsScreenShareSupported] = useState(true);
  const [facingMode, setFacingMode] = useState('user');
  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    const supported = !!navigator.mediaDevices?.getDisplayMedia;
    setIsScreenShareSupported(supported);
    if (supported) {
      console.log('[MEDIA] SCREEN SHARE SUPPORTED');
      setScreenShareMessage('');
      setIsCameraViewMode(false);
    } else {
      console.log('[MEDIA] SCREEN SHARE NOT SUPPORTED');
      setScreenShareMessage(SCREEN_SHARE_UNSUPPORTED_MESSAGE);
      setIsCameraViewMode(true);
    }
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
      setIsCameraViewMode(!isScreenShareSupported);
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
  }, [isScreenShareSupported]);

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

  const restoreCameraPreview = useCallback(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, []);

  const startScreenShare = useCallback(async (onScreenEnded) => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        console.log('[MEDIA] SCREEN SHARE NOT SUPPORTED');
        setScreenShareMessage(SCREEN_SHARE_UNSUPPORTED_MESSAGE);
        return null;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const screenTrack = stream.getVideoTracks()[0];
      if (!screenTrack) {
        console.error('[MEDIA] SCREEN SHARE ERROR: missing video track');
        return null;
      }

      console.log('[MEDIA] SCREEN SHARE STARTED');
      screenTrack.onended = async () => {
        setScreenStream(null);
        setIsSharingScreen(false);
        setIsCameraViewMode(!isScreenShareSupported);
        screenStreamRef.current = null;
        restoreCameraPreview();
        console.log('[MEDIA] SCREEN SHARE STOPPED');
        if (typeof onScreenEnded === 'function') {
          await onScreenEnded();
        }
      };

      screenStreamRef.current = stream;
      setScreenStream(stream);
      setIsSharingScreen(true);
      setIsCameraViewMode(false);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
        console.error('[MEDIA] SCREEN SHARE ERROR:', err);
      }
      return null;
    }
  }, [isScreenShareSupported, restoreCameraPreview]);

  const stopScreenShare = useCallback(() => {
    const stream = screenStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      console.log('[MEDIA] SCREEN SHARE STOPPED');
    }
    setScreenStream(null);
    setIsSharingScreen(false);
    setIsCameraViewMode(!isScreenShareSupported);
    restoreCameraPreview();
  }, [isScreenShareSupported, restoreCameraPreview]);

  const switchCamera = useCallback(async () => {
    const currentLocalStream = localStreamRef.current;
    if (!currentLocalStream || isSharingScreen) {
      return currentLocalStream;
    }

    const nextFacingMode = facingMode === 'user' ? 'environment' : 'user';
    const replacementStream = await navigator.mediaDevices.getUserMedia({
      video: {
        ...MEDIA_CONSTRAINTS.video,
        facingMode: { ideal: nextFacingMode },
      },
      audio: false,
    });

    const newVideoTrack = replacementStream.getVideoTracks()[0];
    if (!newVideoTrack) {
      return currentLocalStream;
    }

    const oldVideoTrack = currentLocalStream.getVideoTracks()[0];
    if (oldVideoTrack) {
      oldVideoTrack.stop();
      currentLocalStream.removeTrack(oldVideoTrack);
    }
    currentLocalStream.addTrack(newVideoTrack);
    replacementStream.getAudioTracks().forEach((track) => track.stop());
    setFacingMode(nextFacingMode);
    setIsCameraViewMode(true);
    setLocalStream(currentLocalStream);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = currentLocalStream;
    }
    return currentLocalStream;
  }, [facingMode, isSharingScreen]);

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
    setIsCameraViewMode(false);
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
    isCameraViewMode,
    screenShareMessage,
    permissionError,
    isLoading,
    isScreenShareSupported,
    localVideoRef,
    requestMedia,
    toggleMic,
    toggleCam,
    switchCamera,
    startScreenShare,
    stopScreenShare,
    stopAllMedia,
    retryPermissions,
  };
}
