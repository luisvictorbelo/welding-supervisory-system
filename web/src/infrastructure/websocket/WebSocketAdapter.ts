// src/infrastructure/websocket/WebSocketAdapter.ts
import type { Telemetry, CommandMessage } from '../../domain/entities/Telemetry';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketAdapter {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  // private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private statusCallback: ((status: ConnectionStatus) => void) | null = null;
  private dataCallback: ((data: Telemetry) => void) | null = null;
  private messageHandler?: (event: MessageEvent) => void;
  private lastMessageTime = 0;
  private commCheckInterval: number | null = null;

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      reconnectInterval: config.reconnectInterval ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10
    };
  }

  async connect(): Promise<void> {
    // return new Promise((resolve, reject) => {
    //   try {
    //     this.updateStatus('connecting');
    //     this.ws = new WebSocket(this.config.url);

    //     this.ws.onopen = () => {
    //       console.log('[WebSocket] Conectado');
    //       // this.reconnectAttempts = 0;
    //       this.updateStatus('connected');
    //       this.startCommCheck();
    //       resolve();
    //     };

    //     this.ws.onmessage = (event) => {
    //       try {
    //         const data: Telemetry = JSON.parse(event.data);
    //         this.lastMessageTime = Date.now();
            
    //         if (this.dataCallback) {
    //           this.dataCallback(data);
    //         }
    //       } catch (error) {
    //         console.error('[WebSocket] Erro ao parsear mensagem:', error);
    //       }
    //     };

    //     this.ws.onerror = (error) => {
    //       console.error('[WebSocket] Erro:', error);
    //       this.updateStatus('error');
    //       reject(error);
    //     };

    //     this.ws.onclose = () => {
    //       console.log('[WebSocket] Desconectado');
    //       this.updateStatus('disconnected');
    //       this.stopCommCheck();
    //       // this.attemptReconnect();
    //     };

    //   } catch (error) {
    //     this.updateStatus('error');
    //     reject(error);
    //   }
    // });

    console.log(this.ws);
    if (this.ws) return;

    this.updateStatus('connecting');

    this.ws = new WebSocket(this.config.url);
    console.log('[WS] connect');

    this.messageHandler = (event: MessageEvent) => {
      try {
        const data: Telemetry = JSON.parse(event.data);
        this.lastMessageTime = Date.now();
        this.dataCallback?.(data);
        // console.log('[WS] message handler attached');
      } catch (error) {
        console.error('[Websocket] Erro no parser:', error)
      }
    };

    this.ws.addEventListener('message', this.messageHandler);
    console.log('[WS] message handler attached')

    this.ws.onopen = () => {
      console.log('[Websocket] Conectado');
      this.updateStatus('connected');
      this.startCommCheck;
    };

    this.ws.onerror = (error) => {
      console.log('[WebSocket] Desconectado:', error);
      this.updateStatus('disconnected');
      this.stopCommCheck();
      this.cleanupSocket();
    };
  }

  // disconnect(): void {
  //   if (this.reconnectTimer) {
  //     clearTimeout(this.reconnectTimer);
  //     this.reconnectTimer = null;
  //   }

  //   this.stopCommCheck();

  //   if (this.ws) {
  //     this.ws.close();
  //     this.ws = null;
  //   }

  //   // this.reconnectAttempts = 0;
  //   this.updateStatus('disconnected');
  // }

  disconnect(): void {
    this.stopCommCheck();
    this.cleanupSocket();
    this.updateStatus('disconnected')
    // this.dataCallback = null;
    // this.statusCallback = null;
    console.log('[WS] disconnect');
  }

  private cleanupSocket() {
    if (!this.ws) return;

    if (this.messageHandler) {
      this.ws.removeEventListener('message', this.messageHandler);
    }

    this.ws.close();
    this.ws = null;
    this.messageHandler = undefined;
  }

  send(message: CommandMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Tentativa de envio com conexão fechada');
    }
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): void {
    this.statusCallback = callback;
  }

  onData(callback: (data: Telemetry) => void): void {
    console.log('[WS] Callback registrado');
    this.dataCallback = callback;
  }

  getStatus(): ConnectionStatus {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'error';
    }
  }

  // private attemptReconnect(): void {
  //   if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
  //     console.error('[WebSocket] Máximo de tentativas de reconexão atingido');
  //     return;
  //   }

  //   this.reconnectAttempts++;
  //   console.log(`[WebSocket] Tentativa de reconexão ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);

  //   this.reconnectTimer = setTimeout(() => {
  //     this.connect().catch(() => {
  //       // Erro já tratado no connect()
  //     });
  //   }, this.config.reconnectInterval);
  // }

  private startCommCheck(): void {
    this.lastMessageTime = Date.now();
    
    this.commCheckInterval = setInterval(() => {
      const elapsed = Date.now() - this.lastMessageTime;
      
      if (elapsed > 5000) { // 5s sem mensagens
        console.warn('[WebSocket] Timeout de comunicação');
        // Dispara alarme de falha de comunicação via callback
        if (this.dataCallback) {
          const fakeData = this.createCommFailTelemetry();
          this.dataCallback(fakeData);
        }
      }
    }, 1000);
  }

  private stopCommCheck(): void {
    if (this.commCheckInterval) {
      clearInterval(this.commCheckInterval);
      this.commCheckInterval = null;
    }
  }

  private createCommFailTelemetry(): Telemetry {
    return {
      voltage: { avg: 0, rms: 0, pk: 0 },
      current: { avg: 0, rms: 0, pk: 0 },
      rpm: 0,
      flow: 0,
      temperature: 0,
      relays: [0, 0, 0, 0, 0],
      mode: 'MIG',
      alarm: {
        overVoltage: false,
        overCurrent: false,
        lowFlow: false,
        overTemp: false,
        commFail: true
      },
      timestamp: Date.now()
    };
  }

  private updateStatus(status: ConnectionStatus): void {
    if (this.statusCallback) {
      this.statusCallback(status);
    }
  }
}