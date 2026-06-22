import { useState, useRef, useCallback, useEffect } from 'react';
import { RTC_CONFIG } from '../utils/constants';
import { sendOffer, sendAnswer, sendIceCandidate } from '../services/socket';

export function usePeer({
  partnerId,
  localStream,
  shouldCreateOffer,
  onOffer,
  onAnswer,
  onIceCandidate,
  onUserLeft,
}) {
  const [remoteStream, setRemoteStream] = useState(null);
  const [isPeerConnected, setIsPeerConnected] = useState(false);

  const peerRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const offerCreatedForPeerRef = useRef(null);
  const activePeerIdRef = useRef(null);

  const attachRemoteStream = useCallback((stream) => {
    setRemoteStream(stream);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
      console.log('[PEER] REMOTE STREAM RECEIVED');
      console.log('[SIGNAL] REMOTE STREAM RECEIVED');
    }
  }, []);

  const destroyPeer = useCallback(() => {
    const peer = peerRef.current;
    if (peer) {
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.onconnectionstatechange = null;
      peer.oniceconnectionstatechange = null;
      peer.close();
      console.log('[PEER] PEER CONNECTION CLOSED');
      peerRef.current = null;
    }
    pendingIceCandidatesRef.current = [];
    remoteStreamRef.current = null;
    offerCreatedForPeerRef.current = null;
    setIsPeerConnected(false);
    setRemoteStream(null);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    console.log('[PEER] REMOTE STREAM CLEARED');
  }, []);

  const createPeerConnection = useCallback(() => {
    if (peerRef.current) {
      return peerRef.current;
    }

    const peer = new RTCPeerConnection(RTC_CONFIG);
    peerRef.current = peer;
    console.log('[PEER] RTCPeerConnection created');

    peer.onicecandidate = (event) => {
      if (event.candidate && activePeerIdRef.current) {
        sendIceCandidate(activePeerIdRef.current, event.candidate);
      }
    };

    peer.onconnectionstatechange = () => {
      console.log(`[PEER] connectionState=${peer.connectionState}`);
      setIsPeerConnected(peer.connectionState === 'connected');
    };

    peer.oniceconnectionstatechange = () => {
      console.log(`[PEER] iceConnectionState=${peer.iceConnectionState}`);
    };

    peer.ontrack = (event) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }

      event.streams[0]?.getTracks().forEach((track) => {
        const hasTrack = remoteStreamRef.current
          .getTracks()
          .some((existingTrack) => existingTrack.id === track.id);
        if (!hasTrack) {
          remoteStreamRef.current.addTrack(track);
        }
      });

      attachRemoteStream(remoteStreamRef.current);
    };

    return peer;
  }, [attachRemoteStream]);

  const syncLocalTracks = useCallback(
    (peer) => {
      if (!peer || !localStream) {
        return;
      }

      const senders = peer.getSenders();
      localStream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);
        if (sender) {
          if (sender.track?.id !== track.id) {
            sender.replaceTrack(track).catch((error) => {
              console.error('[PEER] replaceTrack failed:', error);
            });
          }
        } else {
          peer.addTrack(track, localStream);
        }
      });
    },
    [localStream]
  );

  const flushPendingIceCandidates = useCallback(async () => {
    const peer = peerRef.current;
    if (!peer || !peer.remoteDescription) {
      return;
    }

    while (pendingIceCandidatesRef.current.length > 0) {
      const candidate = pendingIceCandidatesRef.current.shift();
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('[PEER] Failed to add queued ICE candidate:', error);
      }
    }
  }, []);

  const createAndSendOffer = useCallback(async () => {
    if (!partnerId || !localStream || offerCreatedForPeerRef.current === partnerId) {
      return;
    }

    const peer = createPeerConnection();
    syncLocalTracks(peer);

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    sendOffer(partnerId, peer.localDescription);
    offerCreatedForPeerRef.current = partnerId;
  }, [partnerId, localStream, createPeerConnection, syncLocalTracks]);

  useEffect(() => {
    if (!partnerId) {
      activePeerIdRef.current = null;
      destroyPeer();
      return;
    }

    if (activePeerIdRef.current !== partnerId) {
      destroyPeer();
      activePeerIdRef.current = partnerId;
    }

    const peer = createPeerConnection();
    syncLocalTracks(peer);
  }, [partnerId, localStream, createPeerConnection, destroyPeer, syncLocalTracks]);

  useEffect(() => {
    if (!shouldCreateOffer || !partnerId || !localStream) {
      return;
    }

    createAndSendOffer().catch((error) => {
      console.error('[PEER] Failed to create/send offer:', error);
    });
  }, [shouldCreateOffer, partnerId, localStream, createAndSendOffer]);

  useEffect(() => {
    if (!onOffer) {
      return;
    }

    onOffer(async (offer, from) => {
      activePeerIdRef.current = from;
      console.log('[SIGNAL] OFFER RECEIVED');

      const peer = createPeerConnection();
      syncLocalTracks(peer);

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      sendAnswer(from, peer.localDescription);
      await flushPendingIceCandidates();
    });
  }, [onOffer, createPeerConnection, syncLocalTracks, flushPendingIceCandidates]);

  useEffect(() => {
    if (!onAnswer) {
      return;
    }

    onAnswer(async (answer) => {
      console.log('[SIGNAL] ANSWER RECEIVED');
      const peer = peerRef.current;
      if (!peer) {
        return;
      }

      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      await flushPendingIceCandidates();
    });
  }, [onAnswer, flushPendingIceCandidates]);

  useEffect(() => {
    if (!onIceCandidate) {
      return;
    }

    onIceCandidate(async (candidate, from) => {
      if (!candidate) {
        return;
      }

      activePeerIdRef.current = from;
      console.log('[SIGNAL] ICE RECEIVED');

      const peer = createPeerConnection();
      if (peer.remoteDescription) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        pendingIceCandidatesRef.current.push(candidate);
      }
    });
  }, [onIceCandidate, createPeerConnection]);

  useEffect(() => {
    if (!onUserLeft) {
      return;
    }

    onUserLeft(() => {
      console.log('[PEER] USER LEFT RECEIVED');
      activePeerIdRef.current = null;
      destroyPeer();
    });
  }, [onUserLeft, destroyPeer]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log('[PEER] REMOTE STREAM RECEIVED');
      console.log('[SIGNAL] REMOTE STREAM RECEIVED');
    }
  }, [remoteStream]);

  useEffect(() => {
    return () => {
      activePeerIdRef.current = null;
      destroyPeer();
    };
  }, [destroyPeer]);

  const replaceTrack = useCallback((newStream) => {
    const peer = peerRef.current;
    if (!peer || !newStream) {
      return;
    }

    const senders = peer.getSenders();
    newStream.getTracks().forEach((newTrack) => {
      const sender = senders.find((s) => s.track?.kind === newTrack.kind);
      if (sender) {
        sender.replaceTrack(newTrack).catch((error) => {
          console.error('[PEER] replaceTrack failed:', error);
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
