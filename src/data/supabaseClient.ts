export interface SupabaseConfig {
  url?: string;
  anonKey?: string;
}

export interface DatabaseClient {
  isConnected: () => boolean;
  getHealthStatus: () => Promise<{ ok: boolean; message: string }>;
}

class LocalDatabaseClient implements DatabaseClient {
  private config: SupabaseConfig;

  constructor(config: SupabaseConfig = {}) {
    this.config = config;
  }

  isConnected(): boolean {
    return Boolean(this.config.url && this.config.anonKey);
  }

  async getHealthStatus(): Promise<{ ok: boolean; message: string }> {
    if (this.isConnected()) {
      return { ok: true, message: 'Supabase yapılandırması etkin ve hazır.' };
    }
    return { ok: true, message: 'Yerel geliştirme modu (Offline/Standalone hazır).' };
  }
}

export function createDatabaseClient(config?: SupabaseConfig): DatabaseClient {
  return new LocalDatabaseClient(config);
}

export const defaultDatabaseClient = createDatabaseClient({
  url: import.meta.env?.VITE_SUPABASE_URL,
  anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY
});
