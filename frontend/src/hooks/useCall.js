import { useEffect, useRef } from 'react';
import { useMedia } from './useMedia';
import { useSocket } from './useSocket';
import { usePeer } from './usePeer';
import { sendMediaState } from '../services/socket';

const SCREEN_SHARE_UNSUPPORTED_MESSAGE = 'Screen sharing is not supported on this device.';

export function useCall({ showToast } = {}) {
  const media = useMedia();
  const socket = useSocket();
  const peer = usePeer({
    partnerId: socket.partnerId,
    localStream: media.localStream,
    shouldCreateOffer: socket.shouldCreateOffer,
    onOffer: socket.onOffer,
    onAnswer: socket.onAnswer,
    onIceCandidate: socket.onIceCandidate,
    onUserLeft: socket.onUserLeft,
  });

  const prevMicRef = useRef(media.isMicEnabled);
  const prevCamRef = useRef(media.isCamEnabled);

  useEffect(() => {
    if (!media.localStream || !socket.partnerId) return;

    if (prevMicRef.current !== media.isMicEnabled) {
      console.log(`[useCall] Mic state change: ${media.isMicEnabled ? 'on' : 'off'}`);
      sendMediaState('microphone', media.isMicEnabled);
      prevMicRef.current = media.isMicEnabled;
    }

    if (prevCamRef.current !== media.isCamEnabled) {
      console.log(`[useCall] Cam state change: ${media.isCamEnabled ? 'on' : 'off'}`);
      sendMediaState('camera', media.isCamEnabled);
      prevCamRef.current = media.isCamEnabled;
    }
  }, [media.localStream, media.isMicEnabled, media.isCamEnabled, socket.partnerId]);

  useEffect(() => {
    if (!peer.isPeerConnected) return;

    const syncOutgoingVideoTrack = async () => {
      try {
        if (media.isSharingScreen && media.screenStream) {
          await peer.replaceTrack(media.screenStream);
        } else if (media.localStream) {
          await peer.replaceTrack(media.localStream);
        }
      } catch (error) {
        console.error('[CALL] SCREEN SHARE ERROR:', error);
      }
    };

    syncOutgoingVideoTrack();
  }, [
    media.isSharingScreen,
    media.screenStream,
    media.localStream,
    peer.isPeerConnected,
    peer.replaceTrack,
  ]);

  const restoreCameraTrack = async () => {
    if (!media.localStream) {
      return;
    }

    try {
      if (peer.isPeerConnected) {
        await peer.replaceTrack(media.localStream);
      }
      console.log('[CALL] CAMERA RESTORED');
    } catch (error) {
      console.error('[CALL] SCREEN SHARE ERROR:', error);
    }
  };

  const startScreenShare = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      if (typeof showToast === 'function') {
        showToast(SCREEN_SHARE_UNSUPPORTED_MESSAGE);
      }
      return;
    }

    const stream = await media.startScreenShare(async () => {
      await restoreCameraTrack();
    });
    if (!stream) {
      return;
    }

    try {
      if (peer.isPeerConnected) {
        await peer.replaceTrack(stream);
      }
      console.log('[CALL] SCREEN SHARE STARTED');
    } catch (error) {
      console.error('[CALL] SCREEN SHARE ERROR:', error);
    }
  };

  const stopScreenShare = async () => {
    media.stopScreenShare();
    await restoreCameraTrack();
  };

  const switchCamera = async () => {
    try {
      const stream = await media.switchCamera();
      if (!stream || media.isSharingScreen) {
        return;
      }
      if (peer.isPeerConnected) {
        await peer.replaceTrack(stream);
      }
    } catch (error) {
      console.error('[CALL] SCREEN SHARE ERROR:', error);
    }
  };

  const leaveCall = () => {
    console.log('[CALL] LEAVE CLICKED');
    media.stopAllMedia();
    console.log('[CALL] LOCAL TRACKS STOPPED');
    peer.destroyPeer();
    socket.leaveCallSocket();
  };

  return {
    ...media,
    ...socket,
    ...peer,
    startScreenShare,
    stopScreenShare,
    switchCamera,
    leaveCall,
  };
}
