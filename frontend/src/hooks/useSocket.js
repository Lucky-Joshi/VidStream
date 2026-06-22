import { useState, useEffect, useCallback, useRef } from 'react';
import { connectSocket, joinRoom, disconnectSocket } from '../services/socket';
import { CONNECTION_STATES } from '../utils/constants';

export function useSocket() {
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.CONNECTING);
  const [partnerId, setPartnerId] = useState(null);
  const [shouldCreateOffer, setShouldCreateOffer] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [isRoomFull, setIsRoomFull] = useState(false);
  const socketRef = useRef(null);
  const onOfferRef = useRef(null);
  const onAnswerRef = useRef(null);
  const onIceCandidateRef = useRef(null);
  const onMediaStateRef = useRef(null);
  const onPartnerDisconnectedRef = useRef(null);
  const handlerSetupRef = useRef(false);

  useEffect(() => {
    if (handlerSetupRef.current) {
      console.log('[SOCKET HOOK] Handlers already setup, skipping');
      return;
    }

    const socket = connectSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[EVENT] SOCKET CONNECT:', socket.id);
      setSocketId(socket.id);
      setConnectionState(CONNECTION_STATES.CONNECTING);
      setPartnerId(null);
      setShouldCreateOffer(false);
      setIsRoomFull(false);
      joinRoom();
    });

    socket.on('waiting-for-partner', () => {
      console.log('[EVENT] WAITING FOR PARTNER (first user waits)');
      setConnectionState(CONNECTION_STATES.WAITING);
      setPartnerId(null);
      setShouldCreateOffer(false);
    });

    socket.on('user-joined', ({ peerId }) => {
      console.log('[EVENT] USER-JOINED:', peerId);
      setPartnerId(peerId);
    });

    socket.on('ready', ({ peerId, shouldCreateOffer: shouldInitiateOffer }) => {
      console.log(
        `[EVENT] PARTNER-READY: peerId=${peerId}, shouldCreateOffer=${shouldInitiateOffer}`
      );
      setPartnerId(peerId);
      setShouldCreateOffer(Boolean(shouldInitiateOffer));
      setConnectionState(CONNECTION_STATES.CONNECTED);
    });

    socket.on('offer', ({ from, offer }) => {
      console.log('[SIGNAL] OFFER RECEIVED');
      if (onOfferRef.current) {
        onOfferRef.current(offer, from);
      }
    });

    socket.on('answer', ({ from, answer }) => {
      console.log('[SIGNAL] ANSWER RECEIVED');
      if (onAnswerRef.current) {
        onAnswerRef.current(answer, from);
      }
    });

    socket.on('ice-candidate', ({ from, candidate }) => {
      console.log('[SIGNAL] ICE RECEIVED');
      if (onIceCandidateRef.current) {
        onIceCandidateRef.current(candidate, from);
      }
    });

    socket.on('media-state', ({ userId, type, enabled }) => {
      console.log('[EVENT] MEDIA STATE:', type, enabled);
      if (onMediaStateRef.current) {
        onMediaStateRef.current(type, enabled);
      }
    });

    socket.on('partner-disconnected', () => {
      console.log('[EVENT] PARTNER DISCONNECTED');
      setConnectionState(CONNECTION_STATES.WAITING);
      setPartnerId(null);
      setShouldCreateOffer(false);
      if (onPartnerDisconnectedRef.current) {
        onPartnerDisconnectedRef.current();
      }
    });

    socket.on('room-full', () => {
      console.log('[EVENT] ROOM FULL');
      setIsRoomFull(true);
    });

    socket.on('disconnect', () => {
      console.log('[EVENT] SOCKET DISCONNECT');
      setConnectionState(CONNECTION_STATES.RECONNECTING);
    });

    socket.on('reconnect', () => {
      console.log('[EVENT] SOCKET RECONNECT');
      setConnectionState(CONNECTION_STATES.CONNECTING);
      joinRoom();
    });

    socket.on('connect_error', (error) => {
      console.log('[EVENT] SOCKET CONNECTION ERROR:', error);
      setConnectionState(CONNECTION_STATES.RECONNECTING);
    });

    handlerSetupRef.current = true;

    return () => {
      console.log('[SOCKET HOOK] Cleanup');
      socket.removeAllListeners();
    };
  }, []);

  const onOffer = useCallback((handler) => {
    onOfferRef.current = handler;
  }, []);

  const onAnswer = useCallback((handler) => {
    onAnswerRef.current = handler;
  }, []);

  const onIceCandidate = useCallback((handler) => {
    onIceCandidateRef.current = handler;
  }, []);

  const onMediaState = useCallback((handler) => {
    onMediaStateRef.current = handler;
  }, []);

  const onPartnerDisconnected = useCallback((handler) => {
    onPartnerDisconnectedRef.current = handler;
  }, []);

  return {
    connectionState,
    partnerId,
    shouldCreateOffer,
    socketId,
    isRoomFull,
    socket: socketRef.current,
    onOffer,
    onAnswer,
    onIceCandidate,
    onMediaState,
    onPartnerDisconnected,
  };
}
