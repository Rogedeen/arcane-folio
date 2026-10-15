// =============================================================================
// APP PREFERENCES — V3
// Dil, ruleset, tema ve kullanıcı tercihleri
// =============================================================================

import type { Language, Ruleset } from './character';

export interface AppPreferences {
  language: Language;       // 'tr' | 'en'
  ruleset: Ruleset;         // '2014' | '2024'
  soundEnabled: boolean;
  activeCharacterId: string | null;
  theme: 'dark';            // şimdilik sadece dark
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  language: 'tr',
  ruleset: '2014',
  soundEnabled: true,
  activeCharacterId: null,
  theme: 'dark',
};
