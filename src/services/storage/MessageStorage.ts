
import { SyncMessage } from '../types/syncTypes';

export class MessageStorage {
  private storage: Storage;
  private processedMessages: Set<string>;
  private lastProcessedTimestamp: number;
  
  constructor() {
    this.storage = window.localStorage;
    this.processedMessages = new Set();
    this.lastProcessedTimestamp = Date.now() - 60000; // Process last minute's messages
  }

  public saveMessage(type: string, instanceId: string, message: SyncMessage): void {
    const messageId = `pixelcommons_sync_${type}_${instanceId}_${message.timestamp}`;
    
    try {
      this.storage.setItem(messageId, JSON.stringify(message));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      this.cleanupOldMessages(true);
      try {
        this.storage.setItem(messageId, JSON.stringify(message));
      } catch (e) {
        console.error('Failed to save message even after cleanup:', e);
      }
    }
  }

  public cleanupOldMessages(aggressive: boolean = false): void {
    const now = Date.now();
    const MAX_AGE = aggressive ? 2000 : 10000;
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      
      if (key?.startsWith('pixelcommons_sync_')) {
        try {
          const value = this.storage.getItem(key);
          if (value) {
            const message = JSON.parse(value);
            if (now - message.timestamp > MAX_AGE) {
              this.storage.removeItem(key);
              this.processedMessages.delete(key);
            }
          }
        } catch {
          // If can't parse, remove old message
          this.storage.removeItem(key);
        }
      }
    }
    
    // Limit processed messages set size
    if (this.processedMessages.size > 1000) {
      this.processedMessages.clear();
    }
  }

  public hasProcessed(messageId: string): boolean {
    return this.processedMessages.has(messageId);
  }

  public markProcessed(messageId: string, timestamp: number): void {
    this.processedMessages.add(messageId);
    this.lastProcessedTimestamp = Math.max(this.lastProcessedTimestamp, timestamp);
  }

  public getLastProcessedTimestamp(): number {
    return this.lastProcessedTimestamp;
  }
}
