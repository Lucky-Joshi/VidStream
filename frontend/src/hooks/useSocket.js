import { useState, useEffect, useCallback, useRef } from 'react';
import { connectSocket, joinRoom, disconnectSocket } from '../services/socket';
import { CONNECTION_STATES } from '../utils/constants';

export function useSocket() {
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.CONNECTING);
  const [partnerId, setPartnerId] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [isRoomFull, setIsRoomFull] = useState(false);
  const socketRef = useRef(null);
  const onSignalRef = useRef(null);
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
      console.log('[EVENT] SOCKET CONNECTED:', socket.id);
      setSocketId(socket.id);
      setConnectionState(CONNECTION_STATES.CONNECTING);
      setPartnerId(null);
      setIsRoomFull(false);
      joinRoom();
    });

    socket.on('waiting-for-partner', () => {
      console.log('[EVENT] WAITING FOR PARTNER');
      setConnectionState(CONNECTION_STATES.WAITING);
      setPartnerId(null);
    });

    socket.on('partner-joined', ({ peerId }) => {
      console.log('[EVENT] PARTNER JOINED:', peerId);
      setPartnerId(peerId);
      setConnectionState(CONNECTION_STATES.CONNECTED);
    });

    socket.on('signal', ({ sender, signal }) => {
      console.log('[EVENT] SIGNAL RECEIVED:', signal.type, 'from', sender);
      if (onSignalRef.current) {
        onSignalRef.current(signal, sender);
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
      if (onPartnerDisconnectedRef.current) {
        onPartnerDisconnectedRef.current();
      }
    });

    socket.on('room-full', () => {
      console.log('[EVENT] ROOM FULL');
      setIsRoomFull(true);
    });

    socket.on('disconnect', () => {
      console.log('[EVENT] SOCKET DISCONNECTED');
      setConnectionState(CONNECTION_STATES.RECONNECTING);
    });

    socket.on('reconnect', () => {
      console.log('[EVENT] SOCKET RECONNECTING');
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

  const onSignal = useCallback((handler) => {
    onSignalRef.current = handler;
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
    socketId,
    isRoomFull,
    socket: socketRef.current,
    onSignal,
    onMediaState,
    onPartnerDisconnected,
  };
}
