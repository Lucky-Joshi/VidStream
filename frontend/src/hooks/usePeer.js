import { useState, useRef, useCallback, useEffect } from 'react';
import SimplePeer from 'simple-peer';
import { ICE_SERVERS } from '../utils/constants';
import { sendSignal } from '../services/socket';

export function usePeer({ partnerId, socketId, onSignal }) {
  const [remoteStream, setRemoteStream] = useState(null);
  const [isPeerConnected, setIsPeerConnected] = useState(false);
  const peerRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const createPeer = useCallback((initiator) => {
    const peer = new SimplePeer({
      initiator,
      config: { iceServers: ICE_SERVERS },
      trickle: true,
    });

    peer.on('signal', (data) => {
      sendSignal(data);
    });

    peer.on('connect', () => {
      setIsPeerConnected(true);
    });

    peer.on('stream', (stream) => {
      setRemoteStream(stream);
    });

    peer.on('close', () => {
      setIsPeerConnected(false);
      setRemoteStream(null);
      peerRef.current = null;
    });

    peer.on('error', () => {
      peer.destroy();
    });

    peerRef.current = peer;
  }, []);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  });

  useEffect(() => {
    if (!partnerId || !socketId) return;

    if (peerRef.current && !peerRef.current.destroyed) {
      peerRef.current.destroy();
    }

    setIsPeerConnected(false);
    setRemoteStream(null);

    const isInitiator = socketId > partnerId;
    createPeer(isInitiator);

    return () => {
      if (peerRef.current && !peerRef.current.destroyed) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      setIsPeerConnected(false);
    };
  }, [partnerId, socketId, createPeer]);

  useEffect(() => {
    if (!onSignal) return;

    onSignal((signal) => {
      if (peerRef.current && !peerRef.current.destroyed) {
        peerRef.current.signal(signal);
      }
    });
  }, [onSignal]);

  const replaceStream = useCallback((newStream) => {
    if (!peerRef.current || peerRef.current.destroyed || !newStream) return;

    const peer = peerRef.current;

    if (peer._pc) {
      const existingSenders = peer._pc.getSenders();

      newStream.getTracks().forEach((newTrack) => {
        const sender = existingSenders.find((s) => s.track?.kind === newTrack.kind);
        if (sender) {
          sender.replaceTrack(newTrack);
        } else {
          peer.addTrack(newTrack, newStream);
        }
      });
    }
  }, []);

  return {
    remoteStream,
    isPeerConnected,
    remoteVideoRef,
    replaceStream,
  };
}
