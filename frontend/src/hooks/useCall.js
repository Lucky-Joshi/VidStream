import { useEffect, useRef } from 'react';
import { useMedia } from './useMedia';
import { useSocket } from './useSocket';
import { usePeer } from './usePeer';
import { sendMediaState } from '../services/socket';

export function useCall() {
  const media = useMedia();
  const socket = useSocket();
  const peer = usePeer({
    partnerId: socket.partnerId,
    socketId: socket.socketId,
    localStream: media.localStream,
    onSignal: socket.onSignal,
    onPartnerDisconnected: socket.onPartnerDisconnected,
  });

  const prevMicRef = useRef(media.isMicEnabled);
  const prevCamRef = useRef(media.isCamEnabled);

  useEffect(() => {
    if (!media.localStream || !socket.partnerId) return;

    if (prevMicRef.current !== media.isMicEnabled) {
      sendMediaState('microphone', media.isMicEnabled);
      prevMicRef.current = media.isMicEnabled;
    }

    if (prevCamRef.current !== media.isCamEnabled) {
      sendMediaState('camera', media.isCamEnabled);
      prevCamRef.current = media.isCamEnabled;
    }
  }, [media.localStream, media.isMicEnabled, media.isCamEnabled, socket.partnerId]);

  useEffect(() => {
    if (!peer.isPeerConnected) return;

    if (media.isSharingScreen && media.screenStream) {
      peer.replaceTrack(media.screenStream);
    } else if (media.localStream) {
      peer.replaceTrack(media.localStream);
    }
  }, [
    media.isSharingScreen,
    media.screenStream,
    media.localStream,
    peer.isPeerConnected,
    peer.replaceTrack,
  ]);

  const leaveCall = () => {
    media.stopScreenShare();
    if (media.localStream) {
      media.localStream.getTracks().forEach((track) => track.stop());
    }
    window.location.reload();
  };

  return {
    ...media,
    ...socket,
    ...peer,
    leaveCall,
  };
}
