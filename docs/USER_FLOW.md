# User Flow

## User A

Open App
    ↓
Allow Camera
    ↓
Allow Microphone
    ↓
Join Room
    ↓
Wait For Partner
    ↓
Connected
    ↓
Share Screen (Optional)
    ↓
Study Session
    ↓
Leave Call

--------------------------------

## User B

Open App
    ↓
Allow Camera
    ↓
Allow Microphone
    ↓
Join Same Room
    ↓
Connected
    ↓
View Screen Share
    ↓
Study Session
    ↓
Leave Call

--------------------------------

## Happy Path

User A Opens App
        ↓
User B Opens App
        ↓
Connection Established
        ↓
Video Visible
        ↓
Audio Active
        ↓
Screen Shared
        ↓
DSA Practice
        ↓
Call Ended

--------------------------------

## Failure Flow

Permission Denied
        ↓
Show Error Message
        ↓
Retry Permissions

--------------------------------

Connection Lost
        ↓
Reconnect Socket
        ↓
Restore Session