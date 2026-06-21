import { useState, useRef, useCallback, useEffect } from 'react';
import SimplePeer from 'simple-peer';
import { ICE_SERVERS } from '../utils/constants';
import { sendSignal } from '../services/socket';

export function usePeer({ partnerId, socketId, localStream, onSignal, onPartnerDisconnected }) {
  const [remoteStream, setRemoteStream] = useState(null);
  const [isPeerConnected, setIsPeerConnected] = useState(false);
  const peerRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const destroyPeer = useCallback(() => {
    if (peerRef.current) {
      if (!peerRef.current.destroyed) {
        peerRef.current.destroy();
      }
      peerRef.current = null;
    }
    setIsPeerConnected(false);
    setRemoteStream(null);
  }, []);

  const createPeer = useCallback(
    (initiator, stream) => {
      destroyPeer();

      const peer = new SimplePeer({
        initiator,
        stream: stream || undefined,
        config: { iceServers: ICE_SERVERS },
        trickle: true,
      });

      peer.on('signal', (data) => {
        sendSignal(data);
      });

      peer.on('connect', () => {
        setIsPeerConnected(true);
      });

      peer.on('stream', (incomingStream) => {
        setRemoteStream(incomingStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = incomingStream;
        }
      });

      peer.on('close', () => {
        setIsPeerConnected(false);
        setRemoteStream(null);
        peerRef.current = null;
      });

      peer.on('error', (err) => {
        console.warn('Peer error:', err.message);
        destroyPeer();
      });

      peerRef.current = peer;
      return peer;
    },
    [destroyPeer]
  );

  useEffect(() => {
    if (!partnerId || !socketId) {
      destroyPeer();
      return;
    }

    const isInitiator = socketId > partnerId;
    createPeer(isInitiator, localStream);

    return () => {
      destroyPeer();
    };
  }, [partnerId, socketId]);

  useEffect(() => {
    if (!onSignal) return;

    onSignal((signal) => {
      if (peerRef.current && !peerRef.current.destroyed) {
        try {
          peerRef.current.signal(signal);
        } catch (err) {
          console.warn('Signal error:', err.message);
        }
      }
    });
  }, [onSignal]);

  useEffect(() => {
    if (!onPartnerDisconnected) return;

    onPartnerDisconnected(() => {
      destroyPeer();
    });
  }, [onPartnerDisconnected, destroyPeer]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const replaceTrack = useCallback((newStream) => {
    const peer = peerRef.current;
    if (!peer || peer.destroyed || !newStream) return;

    const pc = peer._pc;
    if (!pc) return;

    const senders = pc.getSenders();
    newStream.getTracks().forEach((newTrack) => {
      const sender = senders.find((s) => s.track?.kind === newTrack.kind);
      if (sender) {
        sender.replaceTrack(newTrack).catch(() => {});
      }
    });
  }, []);

  return {
    remoteStream,
    isPeerConnected,
    remoteVideoRef,
    replaceTrack,
    destroyPeer,
  };
}
