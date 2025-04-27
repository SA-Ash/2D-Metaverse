
import { SyncMessage } from '../types/syncTypes';
import { MessageStorage } from '../storage/MessageStorage';

export class BroadcastManager {
  private broadcastChannel: BroadcastChannel | null = null;
  private messageStorage: MessageStorage;
  private instanceId: string;

  constructor(instanceId: string, messageStorage: MessageStorage) {
    this.instanceId = instanceId;
    this.messageStorage = messageStorage;
    this.initializeBroadcastChannel();
  }

  private initializeBroadcastChannel(): void {
    try {
      this.broadcastChannel = new BroadcastChannel('pixel_commons_sync');
      console.log('BroadcastChannel initialized successfully');
    } catch (e) {
      console.log('BroadcastChannel not available, using localStorage only');
    }
  }

  public broadcast(type: string, data: any): void {
    const message: SyncMessage = {
      type,
      data,
      source: this.instanceId,
      timestamp: Date.now()
    };

    // Try BroadcastChannel first
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (error) {
        console.warn('Error using BroadcastChannel:', error);
      }
    }

    // Always use localStorage as fallback
    this.messageStorage.saveMessage(type, this.instanceId, message);
  }

  public close(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
  }
}
