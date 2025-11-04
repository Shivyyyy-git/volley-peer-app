# WebRTC Signaling Server

This is the WebSocket-based signaling server for the Volley peer accountability app.

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

The server will start on `ws://localhost:8080`

## How It Works

The signaling server brokers WebRTC connections between two peers by:
- Creating sessions when a peer creates a link
- Allowing other peers to join sessions
- Relaying WebRTC offers, answers, and ICE candidates between peers

