export const ROOM_ID = 'vidchat-room';

export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export const CONNECTION_STATES = {
  CONNECTING: 'connecting',
  WAITING: 'waiting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
};

export const MEDIA_CONSTRAINTS = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

export const SCREEN_SHARE_CONSTRAINTS = {
  video: {
    cursor: 'always',
  },
  audio: false,
};
