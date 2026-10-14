export interface AppHealth {
  status: 'ok' | 'degraded';
  version: string;
  timestamp: string;
  pwaReady: boolean;
  storageReady: boolean;
}

export interface PhaseInfo {
  id: number;
  name: string;
  description: string;
  status: 'completed' | 'in_progress' | 'planned';
}
