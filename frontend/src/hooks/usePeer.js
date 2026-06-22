import { useState, useRef, useCallback, useEffect } from 'react';
import SimplePeer from 'simple-peer';
import { ICE_SERVERS } from '../utils/constants';
import { sendSignal } from '../services/socket';

export function usePeer({ partnerId, socketId, localStream, onSignal, onPartnerDisconnected }) {
  const [remoteStream, setRemoteStream] = useState(null);
  const [isPeerConnected, setIsPeerConnected] = useState(false);
  const peerRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerCreatedRef = useRef(false);

  const destroyPeer = useCallback(() => {
    console.log('[PEER] Destroying peer connection');
    if (peerRef.current) {
      if (!peerRef.current.destroyed) {
        peerRef.current.destroy();
      }
      peerRef.current = null;
    }
    peerCreatedRef.current = false;
    setIsPeerConnected(false);
    setRemoteStream(null);
  }, []);

  const createPeer = useCallback(
    (initiator, stream) => {
      if (peerCreatedRef.current) {
        console.log('[PEER] Peer already created, skipping');
        return;
      }

      console.log(
        `[PEER] Creating peer connection - initiator: ${initiator}, localStream: ${stream ? 'yes' : 'no'}`
      );

      destroyPeer();

      const peer = new SimplePeer({
        initiator,
        stream: stream || undefined,
        config: {
          iceServers: ICE_SERVERS,
        },
        trickle: true,
      });

      peer.on('signal', (data) => {
        console.log(`[PEER] SIGNAL GENERATED - ${data.type}`);
        if (data.type === 'offer') {
          console.log('[SIGNAL] OFFER SENT');
        } else if (data.type === 'answer') {
          console.log('[SIGNAL] ANSWER SENT');
        } else if (data.type === 'candidate') {
          console.log('[SIGNAL] ICE CANDIDATE SENT');
        }
        sendSignal(data);
      });

      peer.on('connect', () => {
        console.log('[PEER] PEER CONNECTED - WebRTC connection established');
        setIsPeerConnected(true);
      });

      peer.on('stream', (incomingStream) => {
        console.log('[PEER] REMOTE STREAM RECEIVED - tracks:', incomingStream.getTracks().length);
        setRemoteStream(incomingStream);
        if (remoteVideoRef.current) {
          console.log('[PEER] Attaching remote stream to video element');
          remoteVideoRef.current.srcObject = incomingStream;
        }
      });

      peer.on('close', () => {
        console.log('[PEER] Peer connection closed');
        setIsPeerConnected(false);
        setRemoteStream(null);
        peerRef.current = null;
        peerCreatedRef.current = false;
      });

      peer.on('error', (err) => {
        console.error('[PEER] Peer error:', err);
        destroyPeer();
      });

      peerRef.current = peer;
      peerCreatedRef.current = true;
    },
    [destroyPeer]
  );

  // Create peer when partnerId and socketId are both available
  useEffect(() => {
    if (!partnerId || !socketId) {
      console.log('[PEER EFFECT] Missing partnerId or socketId, destroying peer');
      destroyPeer();
      return;
    }

    console.log(`[PEER EFFECT] Both users present - partnerId: ${partnerId}, socketId: ${socketId}`);
    const isInitiator = socketId > partnerId;
    console.log(`[PEER EFFECT] Initiator: ${isInitiator}`);

    // Always create peer when we have both users
    createPeer(isInitiator, localStream);

    return () => {
      console.log('[PEER EFFECT] Cleanup');
      // Don't destroy on cleanup, let disconnect handle it
    };
  }, [partnerId, socketId, createPeer]);

  // Re-create peer if localStream changes after peer was created
  useEffect(() => {
    if (!partnerId || !socketId || !peerCreatedRef.current) {
      return;
    }

    if (!localStream) {
      console.log('[LOCALSTREAM EFFECT] Local stream became null');
      return;
    }

    console.log('[LOCALSTREAM EFFECT] Local stream updated, recreating peer');
    peerCreatedRef.current = false;
    const isInitiator = socketId > partnerId;
    createPeer(isInitiator, localStream);
  }, [localStream, partnerId, socketId, createPeer]);

  // Register signal handler
  useEffect(() => {
    if (!onSignal) return;

    const handleSignal = (signal, sender) => {
      console.log(`[PEER SIGNAL HANDLER] Received ${signal.type} from ${sender}`);

      if (signal.type === 'offer') {
        console.log('[SIGNAL] OFFER RECEIVED');
      } else if (signal.type === 'answer') {
        console.log('[SIGNAL] ANSWER RECEIVED');
      } else if (signal.type === 'candidate') {
        console.log('[SIGNAL] ICE CANDIDATE RECEIVED');
      }

      if (peerRef.current && !peerRef.current.destroyed) {
        try {
          peerRef.current.signal(signal);
          console.log(`[PEER] Successfully signaled with ${signal.type}`);
        } catch (err) {
          console.error('[PEER] Signal error:', err.message);
        }
      } else {
        console.warn('[PEER] Peer not ready to signal');
      }
    };

    onSignal(handleSignal);
  }, [onSignal]);

  // Register disconnect handler
  useEffect(() => {
    if (!onPartnerDisconnected) return;

    onPartnerDisconnected(() => {
      console.log('[PARTNER DISCONNECT] Partner disconnected, destroying peer');
      destroyPeer();
    });
  }, [onPartnerDisconnected, destroyPeer]);

  // Ensure remote stream is attached to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log('[REMOTE STREAM EFFECT] Attaching stream to video element');
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Track replacement for screen sharing
  const replaceTrack = useCallback((newStream) => {
    const peer = peerRef.current;
    if (!peer || peer.destroyed || !newStream) {
      console.log('[REPLACE TRACK] Cannot replace - peer not ready');
      return;
    }

    const pc = peer._pc;
    if (!pc) {
      console.log('[REPLACE TRACK] No peer connection');
      return;
    }

    console.log('[REPLACE TRACK] Replacing tracks');
    const senders = pc.getSenders();
    newStream.getTracks().forEach((newTrack) => {
      const sender = senders.find((s) => s.track?.kind === newTrack.kind);
      if (sender) {
        sender.replaceTrack(newTrack).catch((err) => {
          console.error('[REPLACE TRACK] Error:', err);
        });
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
