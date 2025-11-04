
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
      return Promise.resolve();
    }
    
    if (this.openPromise) {
        return this.openPromise;
    }

    this.ws = new WebSocket(SIGNALING_SERVER_URL);
    
    this.openPromise = new Promise((resolve, reject) => {
        if (!this.ws) {
            return reject(new Error("WebSocket is not initialized"));
        }
      this.ws.onopen = () => {
        console.log('Connected to signaling server.');
        resolve();
      };
      this.ws.onerror = (error) => {
        console.error('Signaling server error:', error);
        reject(error);
        this.openPromise = null;
      };
    });

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.messageListener) {
          this.messageListener(data);
        }
      } catch (e) {
        console.error('Failed to parse signaling message:', event.data);
      }
    };
    
    this.ws.onclose = () => {
        console.log('Disconnected from signaling server.');
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
      console.warn('WebSocket is not open. Waiting for connection...');
      await this.connect();
    }
    if (this.ws) {
        this.ws.send(JSON.stringify(data));
    }
  }

  close() {
    this.ws?.close();
    this.ws = null;
    this.openPromise = null;
  }
}

export const signalingService = new SignalingService();