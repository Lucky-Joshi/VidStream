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

      console.log(`Creating peer: initiator=${initiator}, stream=${stream ? 'yes' : 'no'}`);

      const peer = new SimplePeer({
        initiator,
        stream: stream || undefined,
        config: { iceServers: ICE_SERVERS },
        trickle: true,
      });

      peer.on('signal', (data) => {
        console.log(`[usePeer] Signaling:${data.type} iceState:${peer._pc?.iceConnectionState}`);
        sendSignal(data);
      });

      peer.on('connect', () => {
        console.log('[usePeer] Connected!');
        setIsPeerConnected(true);
      });

      peer.on('stream', (incomingStream) => {
        console.log(`[usePeer] Remote stream received: ${incomingStream.getTracks().length} tracks`, incomingStream.getTracks().map(t => `${t.kind}:${t.id}`));
        setRemoteStream(incomingStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = incomingStream;
          console.log('[usePeer] Assigned stream to remoteVideoRef');
        } else {
          console.warn('[usePeer] remoteVideoRef not available yet');
        }
      });

      peer.on('close', () => {
        console.log('[usePeer] Peer closed');
        setIsPeerConnected(false);
        setRemoteStream(null);
        peerRef.current = null;
      });

      peer.on('error', (err) => {
        console.warn('[usePeer] Error:', err.message);
        destroyPeer();
      });

      peerRef.current = peer;
      return peer;
    },
    [destroyPeer]
  );

  useEffect(() => {
    if (!partnerId || !socketId || !localStream) {
      if (!partnerId || !socketId) {
        destroyPeer();
      }
      return;
    }

    console.log(`[usePeer] Creating peer - initiator:${socketId > partnerId}, partnerId:${partnerId}, localStream:${localStream.getTracks().length}tracks`);
    const isInitiator = socketId > partnerId;
    createPeer(isInitiator, localStream);

    return () => {
      console.log('[usePeer] Cleaning up peer');
      destroyPeer();
    };
  }, [partnerId, socketId, localStream]);

  useEffect(() => {
    if (!onSignal || !peerRef.current) return;

    const handleSignal = (signal) => {
      if (peerRef.current && !peerRef.current.destroyed) {
        try {
          peerRef.current.signal(signal);
        } catch (err) {
          console.warn('Signal error:', err.message);
        }
      }
    };

    onSignal(handleSignal);
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
