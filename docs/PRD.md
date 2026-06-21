# Product Requirements Document (PRD)

## Product Name
VidChat

## Vision

A lightweight platform that enables two people to connect instantly through video calls and screen sharing while solving DSA problems together.

The application removes unnecessary complexity found in traditional meeting tools and focuses entirely on collaborative coding sessions.

---

## Problem Statement

Students preparing for coding interviews often use multiple tools:

- Google Meet for calls
- WhatsApp for communication
- LeetCode for problems
- VS Code for coding

Switching between platforms creates friction.

The goal is to provide a minimal environment for pair programming and DSA practice.

---

## Target Users

### Primary Users

- College students
- Placement aspirants
- Coding buddies
- Competitive programmers

### Secondary Users

- Mentors
- Tutors
- Interview preparation groups

---

## Core Features

### Video Calling

Users can:

- Enable camera
- Disable camera
- View partner video

### Audio Calling

Users can:

- Mute microphone
- Unmute microphone

### Screen Sharing

Users can:

- Share screen
- Stop sharing screen

### Fixed Study Room

Users automatically join a predefined room.

No account creation required.

---

## Non-Functional Requirements

### Performance

- Call connection < 5 seconds
- Low latency communication

### Reliability

- Stable peer connection
- Automatic reconnection

### Security

- HTTPS required
- Secure WebRTC communication

---

## MVP Scope

Included:

- Video Call
- Audio Call
- Screen Sharing
- Leave Call

Excluded:

- Authentication
- Chat
- Database
- Recording
- Whiteboard
- Collaborative Editor

---

## Success Metrics

- Successful connection rate
- Session duration
- Screen share usage
- Call stability

---

## Future Enhancements

- Shared Code Editor
- Whiteboard
- Session Recording
- AI DSA Assistant
- Shared Timer
- Room Creation