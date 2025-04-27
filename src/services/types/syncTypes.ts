
export interface SyncMessage {
  type: string;
  data: any;
  source: string;
  timestamp: number;
}

export type MessageHandler = (message: SyncMessage) => void;

export interface BroadcastOptions {
  useLocalStorage?: boolean;
  cleanupInterval?: number;
}
