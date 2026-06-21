import { useState, useEffect, useCallback, useRef } from 'react';
import { connectSocket, joinRoom, disconnectSocket } from '../services/socket';
import { CONNECTION_STATES } from '../utils/constants';

export function useSocket() {
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.CONNECTING);
  const [partnerId, setPartnerId] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const socketRef = useRef(null);

  const onSignalRef = useRef(null);
  const onMediaStateRef = useRef(null);

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketId(socket.id);
      setConnectionState(CONNECTION_STATES.CONNECTING);
      setPartnerId(null);
      joinRoom();
    });

    socket.on('waiting-for-partner', () => {
      setConnectionState(CONNECTION_STATES.WAITING);
      setPartnerId(null);
    });

    socket.on('partner-joined', ({ peerId }) => {
      setPartnerId(peerId);
      setConnectionState(CONNECTION_STATES.CONNECTED);
    });

    socket.on('signal', ({ sender, signal }) => {
      if (onSignalRef.current) {
        onSignalRef.current(signal, sender);
      }
    });

    socket.on('partner-disconnected', () => {
      setConnectionState(CONNECTION_STATES.WAITING);
      setPartnerId(null);
    });

    socket.on('disconnect', () => {
      setConnectionState(CONNECTION_STATES.RECONNECTING);
    });

    socket.on('connect_error', () => {
      setConnectionState(CONNECTION_STATES.RECONNECTING);
    });

    socket.on('media-state', ({ type, enabled }) => {
      if (onMediaStateRef.current) {
        onMediaStateRef.current(type, enabled);
      }
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

  return {
    connectionState,
    partnerId,
    socketId,
    socket: socketRef.current,
    onSignal,
    onMediaState,
  };
}
