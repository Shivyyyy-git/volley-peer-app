
// A simple abstraction over the WebSocket API for WebRTC signaling.
// This connects to a public signaling server to broker the connection between two peers.

// Use environment variable or default to localhost for development
const SIGNALING_SERVER_URL = import.meta.env.VITE_SIGNALING_SERVER_URL || 'ws://localhost:8080';

type MessageListener = (data: any) => void;

class SignalingService {
  private ws: WebSocket | null = null;
  private messageListener: MessageListener | null = null;
  private openPromise: Promise<void> | null = null;

  connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }
    
    if (this.openPromise) {
        console.log('WebSocket connection already in progress...');
        return this.openPromise;
    }

    console.log('Connecting to signaling server:', SIGNALING_SERVER_URL);
    this.ws = new WebSocket(SIGNALING_SERVER_URL);
    
    this.openPromise = new Promise((resolve, reject) => {
        if (!this.ws) {
            return reject(new Error("WebSocket is not initialized"));
        }
        
        const timeout = setTimeout(() => {
          console.error('WebSocket connection timeout after 10 seconds');
          reject(new Error('Connection timeout'));
          this.openPromise = null;
          if (this.ws) {
            this.ws.close();
            this.ws = null;
          }
        }, 10000);
        
      this.ws.onopen = () => {
        clearTimeout(timeout);
        console.log('✅ Connected to signaling server at:', SIGNALING_SERVER_URL);
        resolve();
      };
      this.ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ Signaling server error:', error);
        console.error('Failed to connect to:', SIGNALING_SERVER_URL);
        reject(error);
        this.openPromise = null;
      };
    });

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📥 Received message:', data.type, data.sessionId ? `(session: ${data.sessionId})` : '');
        if (this.messageListener) {
          this.messageListener(data);
        } else {
          console.warn('⚠️ No message listener set, dropping message:', data.type);
        }
      } catch (e) {
        console.error('Failed to parse signaling message:', event.data, e);
      }
    };
    
    this.ws.onclose = (event) => {
        console.log('Disconnected from signaling server. Code:', event.code, 'Reason:', event.reason);
        this.ws = null;
        this.openPromise = null;
    }

    return this.openPromise;
  }

  onMessage(callback: MessageListener) {
    this.messageListener = callback;
  }

  async send(data: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not open. Current state:', this.ws?.readyState, 'Connecting...');
      await this.connect();
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const message = JSON.stringify(data);
        console.log('📤 Sending message:', data.type, data.sessionId ? `(session: ${data.sessionId})` : '');
        this.ws.send(message);
    } else {
        console.error('❌ Cannot send message: WebSocket not open. State:', this.ws?.readyState);
    }
  }

  close() {
    this.ws?.close();
    this.ws = null;
    this.openPromise = null;
  }
}

export const signalingService = new SignalingService();