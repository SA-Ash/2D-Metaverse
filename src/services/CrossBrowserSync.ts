
import { SyncMessage, MessageHandler, BroadcastOptions } from './types/syncTypes';
import { MessageStorage } from './storage/MessageStorage';
import { BroadcastManager } from './broadcast/BroadcastManager';

class CrossBrowserSync {
  private instanceId: string;
  private handlers: Map<string, MessageHandler[]>;
  private broadcastManager: BroadcastManager;
  private messageStorage: MessageStorage;
  private syncInterval: number | null;
  private isActive: boolean;

  constructor() {
    this.instanceId = `instance-${Math.random().toString(36).substring(2, 9)}`;
    this.handlers = new Map();
    this.messageStorage = new MessageStorage();
    this.broadcastManager = new BroadcastManager(this.instanceId, this.messageStorage);
    this.syncInterval = null;
    this.isActive = false;
    
    console.log(`CrossBrowserSync initialized with ID: ${this.instanceId}`);
  }

  public start(): void {
    if (this.isActive) {
      console.log('CrossBrowserSync already active');
      return;
    }
    
    // Start periodic message check
    this.syncInterval = window.setInterval(() => this.checkForMessages(), 50);
    
    // Broadcast presence
    this.broadcastMessage('system', {
      action: 'user_joined',
      id: this.instanceId,
      time: Date.now()
    });
    
    this.isActive = true;
    console.log('CrossBrowserSync started');
  }

  public stop(): void {
    if (!this.isActive) return;
    
    if (this.syncInterval) {
      window.clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.broadcastManager.close();
    this.isActive = false;
    console.log('CrossBrowserSync stopped');
  }

  public on(type: string, handler: MessageHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  public sendMessage(type: string, data: any): void {
    if (!this.isActive) {
      console.warn('CrossBrowserSync not active, message not sent');
      return;
    }
    this.broadcastMessage(type, data);
  }

  private broadcastMessage(type: string, data: any): void {
    this.broadcastManager.broadcast(type, data);
  }

  private checkForMessages(): void {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key?.startsWith('pixelcommons_sync_')) {
        const value = localStorage.getItem(key);
        if (!value || this.messageStorage.hasProcessed(key)) continue;
        
        try {
          const message = JSON.parse(value) as SyncMessage;
          
          if (message.source === this.instanceId) continue;
          
          if (message.timestamp <= this.messageStorage.getLastProcessedTimestamp()) continue;
          
          this.messageStorage.markProcessed(key, message.timestamp);
          
          if (message.type === 'system') {
            this.handleSystemMessage(message);
          }
          
          this.notifyHandlers(message);
          
        } catch (error) {
          console.error('Error processing sync message:', error);
        }
      }
    }
    
    // Periodic cleanup
    if (Math.random() < 0.1) {
      this.messageStorage.cleanupOldMessages();
    }
  }

  private handleSystemMessage(message: SyncMessage): void {
    const { action, requesterId } = message.data;
    
    if (action === 'request_users_announce' && requesterId !== this.instanceId) {
      const userData = localStorage.getItem('pixel_commons_user');
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          setTimeout(() => {
            this.sendMessage('character', {
              action: 'joined',
              user: {
                id: parsedUserData.id,
                name: parsedUserData.name,
                color: parsedUserData.color,
                position: parsedUserData.position || { x: 400, y: 300 },
                isMoving: false,
                direction: 'down',
              }
            });
          }, Math.random() * 500);
        } catch (e) {
          console.error('Error announcing user:', e);
        }
      }
    }
  }

  private notifyHandlers(message: SyncMessage): void {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
  }

  public isRunning(): boolean {
    return this.isActive;
  }
}

export const crossBrowserSync = new CrossBrowserSync();
export default crossBrowserSync;
export type { SyncMessage };
