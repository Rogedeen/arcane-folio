import { SyncEvent } from '../types/campaign';

type SyncCallback = (event: SyncEvent) => void;

class SyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('dnd-campaign-sync');
        this.channel.onmessage = (ev: MessageEvent<SyncEvent>) => {
          this.notifyListeners(ev.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization error:', err);
      }
    }
  }

  public subscribe(cb: SyncCallback): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public broadcast(event: SyncEvent): void {
    // Broadcast to other tabs/windows
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (err) {
        console.warn('Sync broadcast failed:', err);
      }
    }
  }

  public broadcastDiceRoll(roll: unknown): void {
    this.broadcast({
      type: 'DICE_ROLLED',
      campaignId: 'global',
      senderRole: 'player',
      payload: roll,
      timestamp: new Date().toISOString(),
    });
  }

  private notifyListeners(event: SyncEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  public close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

export const syncService = new SyncService();
