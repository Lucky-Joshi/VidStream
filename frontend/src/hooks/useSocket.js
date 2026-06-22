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

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[useSocket] Connected: ${socket.id}`);
      setSocketId(socket.id);
      setConnectionState(CONNECTION_STATES.CONNECTING);
      setPartnerId(null);
      setIsRoomFull(false);
      joinRoom();
    });

    socket.on('waiting-for-partner', () => {
      console.log('[useSocket] Waiting for partner');
      setConnectionState(CONNECTION_STATES.WAITING);
      setPartnerId(null);
    });

    socket.on('partner-joined', ({ peerId }) => {
      console.log(`[useSocket] Partner joined: ${peerId}, myId: ${socket.id}`);
      setPartnerId(peerId);
      setConnectionState(CONNECTION_STATES.CONNECTED);
    });

    socket.on('signal', ({ sender, signal }) => {
      console.log(`[useSocket] Signal received:${signal.type} from:${sender}`);
      if (onSignalRef.current) {
        onSignalRef.current(signal, sender);
      }
    });

    socket.on('media-state', ({ type, enabled }) => {
      if (onMediaStateRef.current) {
        onMediaStateRef.current(type, enabled);
      }
    });

    socket.on('partner-disconnected', () => {
      setConnectionState(CONNECTION_STATES.WAITING);
      setPartnerId(null);
      if (onPartnerDisconnectedRef.current) {
        onPartnerDisconnectedRef.current();
      }
    });

    socket.on('room-full', () => {
      setIsRoomFull(true);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[useSocket] Disconnected: ${reason}`);
      setConnectionState(CONNECTION_STATES.RECONNECTING);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`[useSocket] Reconnected after ${attempt} attempts`);
      setConnectionState(CONNECTION_STATES.CONNECTING);
      joinRoom();
    });

    socket.on('connect_error', (err) => {
      console.error(`[useSocket] Connection error: ${err.message}`);
      setConnectionState(CONNECTION_STATES.RECONNECTING);
    });

    return () => {
      disconnectSocket();
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
