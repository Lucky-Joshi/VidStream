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
    onSignal: socket.onSignal,
  });

  const streamAddedRef = useRef(false);
  const prevPartnerId = useRef(null);

  useEffect(() => {
    if (media.localStream) {
      sendMediaState('camera', media.isCamEnabled);
      sendMediaState('microphone', media.isMicEnabled);
    }
  }, [media.localStream, media.isCamEnabled, media.isMicEnabled]);

  useEffect(() => {
    if (prevPartnerId.current && !socket.partnerId) {
      streamAddedRef.current = false;
    }
    prevPartnerId.current = socket.partnerId;

    if (!socket.partnerId || !media.localStream) return;

    if (!streamAddedRef.current) {
      peer.replaceStream(media.localStream);
      streamAddedRef.current = true;
    }
  }, [socket.partnerId, media.localStream, peer.replaceStream]);

  useEffect(() => {
    if (!media.isSharingScreen) {
      if (streamAddedRef.current && media.localStream) {
        peer.replaceStream(media.localStream);
      }
      return;
    }

    if (media.screenStream) {
      peer.replaceStream(media.screenStream);
    }
  }, [media.isSharingScreen, media.screenStream, media.localStream, peer.replaceStream]);

  return {
    ...media,
    ...socket,
    ...peer,
  };
}
