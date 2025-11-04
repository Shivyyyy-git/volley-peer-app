const WebSocket = require('ws');

// Create WebSocket server on port from environment or default to 8080
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

// Data structure to manage sessions: sessionId -> Set of WebSocket clients
const sessions = new Map();

console.log(`WebRTC Signaling Server started on port ${PORT}`);

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Track which session this client belongs to
  let clientSessionId = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      const { type, sessionId } = message;

      switch (type) {
        case 'create':
          // Create a new session and add the client to it
          if (!sessions.has(sessionId)) {
            sessions.set(sessionId, new Set());
            console.log(`Session created: ${sessionId}`);
          }
          sessions.get(sessionId).add(ws);
          clientSessionId = sessionId;
          console.log(`Client added to session: ${sessionId}`);
          break;

        case 'join':
          // Add client to existing session
          if (!sessions.has(sessionId)) {
            sessions.set(sessionId, new Set());
            console.log(`Session created on join: ${sessionId}`);
          }
          
          const session = sessions.get(sessionId);
          session.add(ws);
          clientSessionId = sessionId;
          console.log(`Client joined session: ${sessionId}`);

          // Notify the other client(s) in the session that a peer has joined
          session.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'peer-joined',
                sessionId: sessionId
              }));
              console.log(`Sent peer-joined notification for session: ${sessionId}`);
            }
          });
          break;

        case 'offer':
        case 'answer':
        case 'candidate':
          // Relay WebRTC signaling data to other clients in the session
          if (sessions.has(sessionId)) {
            const session = sessions.get(sessionId);
            session.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
                console.log(`Relayed ${type} message in session: ${sessionId}`);
              }
            });
          }
          break;

        default:
          console.log(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    
    // Remove the client from their session
    if (clientSessionId && sessions.has(clientSessionId)) {
      const session = sessions.get(clientSessionId);
      session.delete(ws);
      
      // If the session is now empty, delete it to clean up resources
      if (session.size === 0) {
        sessions.delete(clientSessionId);
        console.log(`Session deleted (empty): ${clientSessionId}`);
      } else {
        console.log(`Client removed from session: ${clientSessionId}, ${session.size} client(s) remaining`);
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing WebSocket server');
  wss.close(() => {
    console.log('WebSocket server closed');
  });
});

