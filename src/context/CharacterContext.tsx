// =============================================================================
// CHARACTER CONTEXT — V3
// Global karakter state'i. Tüm bileşenler buradan okur/yazar.
// Sayfa yenilenince localStorage'dan otomatik yüklenir.
// =============================================================================

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { FullCharacter } from '../types/character';
import {
  loadCharacters,
  saveCharacters,
  saveCharacter as persistSave,
  deleteCharacter as persistDelete,
  loadPreferences,
  savePreferences,
  exportCharacterAsJSON,
  importCharacterFromJSON,
} from '../data/persistenceService';
import { syncService } from '../data/syncService';
import type { AppPreferences } from '../types/app';

// --- State Tipi ---

interface CharacterState {
  characters: FullCharacter[];
  activeCharacterId: string | null;
  preferences: AppPreferences;
  isLoaded: boolean; // localStorage yüklendikten sonra true
}

// --- Action Tipleri ---

type CharacterAction =
  | { type: 'INIT'; payload: { characters: FullCharacter[]; preferences: AppPreferences } }
  | { type: 'SAVE_CHARACTER'; payload: FullCharacter }
  | { type: 'DELETE_CHARACTER'; payload: string }
  | { type: 'SET_ACTIVE'; payload: string | null }
  | { type: 'UPDATE_ACTIVE_HP'; payload: { currentHp: number; tempHp?: number } }
  | { type: 'UPDATE_ACTIVE_SPELL_SLOT'; payload: { level: number; expended: number } }
  | { type: 'UPDATE_ACTIVE_CONDITIONS'; payload: string[] }
  | { type: 'UPDATE_ACTIVE_DEATH_SAVES'; payload: { successes: number; failures: number } }
  | { type: 'UPDATE_ACTIVE_INSPIRATION'; payload: number }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<AppPreferences> };

// --- Reducer ---

function characterReducer(
  state: CharacterState,
  action: CharacterAction
): CharacterState {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        characters: action.payload.characters,
        preferences: action.payload.preferences,
        activeCharacterId: action.payload.preferences.activeCharacterId,
        isLoaded: true,
      };

    case 'SAVE_CHARACTER': {
      const idx = state.characters.findIndex((c) => c.id === action.payload.id);
      const updated = { ...action.payload, updatedAt: new Date().toISOString() };
      const next =
        idx >= 0
          ? state.characters.map((c) => (c.id === updated.id ? updated : c))
          : [...state.characters, updated];
      return { ...state, characters: next };
    }

    case 'DELETE_CHARACTER': {
      const next = state.characters.filter((c) => c.id !== action.payload);
      const activeId =
        state.activeCharacterId === action.payload ? null : state.activeCharacterId;
      return { ...state, characters: next, activeCharacterId: activeId };
    }

    case 'SET_ACTIVE':
      return { ...state, activeCharacterId: action.payload };

    case 'UPDATE_ACTIVE_HP': {
      if (!state.activeCharacterId) return state;
      return {
        ...state,
        characters: state.characters.map((c) =>
          c.id === state.activeCharacterId
            ? {
                ...c,
                currentHp: action.payload.currentHp,
                tempHp: action.payload.tempHp ?? c.tempHp,
                updatedAt: new Date().toISOString(),
              }
            : c
        ),
      };
    }

    case 'UPDATE_ACTIVE_SPELL_SLOT': {
      if (!state.activeCharacterId) return state;
      return {
        ...state,
        characters: state.characters.map((c) => {
          if (c.id !== state.activeCharacterId) return c;
          const slots = { ...(c.spellSlots ?? {}) };
          if (slots[action.payload.level]) {
            slots[action.payload.level] = {
              ...slots[action.payload.level],
              expended: action.payload.expended,
            };
          }
          return { ...c, spellSlots: slots, updatedAt: new Date().toISOString() };
        }),
      };
    }

    case 'UPDATE_ACTIVE_CONDITIONS': {
      if (!state.activeCharacterId) return state;
      return {
        ...state,
        characters: state.characters.map((c) =>
          c.id === state.activeCharacterId
            ? { ...c, activeConditions: action.payload, updatedAt: new Date().toISOString() }
            : c
        ),
      };
    }

    case 'UPDATE_ACTIVE_DEATH_SAVES': {
      if (!state.activeCharacterId) return state;
      return {
        ...state,
        characters: state.characters.map((c) =>
          c.id === state.activeCharacterId
            ? { ...c, deathSaves: action.payload, updatedAt: new Date().toISOString() }
            : c
        ),
      };
    }

    case 'UPDATE_ACTIVE_INSPIRATION': {
      if (!state.activeCharacterId) return state;
      return {
        ...state,
        characters: state.characters.map((c) =>
          c.id === state.activeCharacterId
            ? { ...c, inspiration: Math.max(0, action.payload), updatedAt: new Date().toISOString() }
            : c
        ),
      };
    }

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };

    default:
      return state;
  }
}

// --- Context Tipi ---

interface CharacterContextValue {
  state: CharacterState;
  activeCharacter: FullCharacter | null;

  // Karakter CRUD
  saveCharacter: (character: FullCharacter) => void;
  deleteCharacter: (id: string) => void;
  setActiveCharacter: (id: string | null) => void;

  // Aktif karakter güncellemeleri (sık kullanılan)
  updateHp: (currentHp: number, tempHp?: number) => void;
  updateSpellSlot: (level: number, expended: number) => void;
  updateConditions: (conditions: string[]) => void;
  updateDeathSaves: (successes: number, failures: number) => void;
  updateInspiration: (inspiration: number) => void;

  // Tercihler
  updatePreferences: (prefs: Partial<AppPreferences>) => void;

  // Export/Import
  exportCharacter: (id: string) => void;
  importCharacter: (file: File) => Promise<boolean>;
}

// --- Context ---

const CharacterContext = createContext<CharacterContextValue | null>(null);

// --- Provider ---

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(characterReducer, {
    characters: [],
    activeCharacterId: null,
    preferences: {
      language: 'tr',
      ruleset: '2014',
      soundEnabled: true,
      activeCharacterId: null,
      theme: 'dark',
    },
    isLoaded: false,
  });

  // İlk yükleme: localStorage'dan oku
  useEffect(() => {
    const characters = loadCharacters();
    const preferences = loadPreferences();
    dispatch({ type: 'INIT', payload: { characters, preferences } });
  }, []);

  // State değişince localStorage'a yaz (isLoaded olduktan sonra)
  useEffect(() => {
    if (!state.isLoaded) return;
    saveCharacters(state.characters);
  }, [state.characters, state.isLoaded]);

  useEffect(() => {
    if (!state.isLoaded) return;
    savePreferences({
      ...state.preferences,
      activeCharacterId: state.activeCharacterId,
    });
  }, [state.preferences, state.activeCharacterId, state.isLoaded]);

  // Aktif karakter (computed)
  const activeCharacter =
    state.characters.find((c) => c.id === state.activeCharacterId) ?? null;

  // DM'den gelen ilham ödüllerini dinle ve stackle
  useEffect(() => {
    const unsub = syncService.subscribe((event) => {
      if (event.type === 'INSPIRATION_AWARDED' && event.payload?.playerName) {
        const targetName = String(event.payload.playerName).toLowerCase();
        if (activeCharacter && activeCharacter.name.toLowerCase() === targetName) {
          dispatch({
            type: 'UPDATE_ACTIVE_INSPIRATION',
            payload: (activeCharacter.inspiration ?? 0) + 1,
          });
        }
      }
    });
    return unsub;
  }, [activeCharacter]);

  // --- Action Wrappers ---

  const saveCharacter = useCallback((character: FullCharacter) => {
    dispatch({ type: 'SAVE_CHARACTER', payload: character });
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CHARACTER', payload: id });
    persistDelete(id);
  }, []);

  const setActiveCharacter = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE', payload: id });
  }, []);

  const updateHp = useCallback((currentHp: number, tempHp?: number) => {
    dispatch({ type: 'UPDATE_ACTIVE_HP', payload: { currentHp, tempHp } });
  }, []);

  const updateSpellSlot = useCallback((level: number, expended: number) => {
    dispatch({ type: 'UPDATE_ACTIVE_SPELL_SLOT', payload: { level, expended } });
  }, []);

  const updateConditions = useCallback((conditions: string[]) => {
    dispatch({ type: 'UPDATE_ACTIVE_CONDITIONS', payload: conditions });
  }, []);

  const updateDeathSaves = useCallback((successes: number, failures: number) => {
    dispatch({ type: 'UPDATE_ACTIVE_DEATH_SAVES', payload: { successes, failures } });
  }, []);

  const updateInspiration = useCallback((inspiration: number) => {
    dispatch({ type: 'UPDATE_ACTIVE_INSPIRATION', payload: inspiration });
  }, []);

  const updatePreferences = useCallback((prefs: Partial<AppPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: prefs });
  }, []);

  const exportCharacter = useCallback(
    (id: string) => {
      const char = state.characters.find((c) => c.id === id);
      if (char) exportCharacterAsJSON(char);
    },
    [state.characters]
  );

  const importCharacter = useCallback(async (file: File): Promise<boolean> => {
    const char = await importCharacterFromJSON(file);
    if (!char) return false;
    dispatch({ type: 'SAVE_CHARACTER', payload: char });
    persistSave(char);
    return true;
  }, []);

  const value: CharacterContextValue = {
    state,
    activeCharacter,
    saveCharacter,
    deleteCharacter,
    setActiveCharacter,
    updateHp,
    updateSpellSlot,
    updateConditions,
    updateDeathSaves,
    updateInspiration,
    updatePreferences,
    exportCharacter,
    importCharacter,
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

const DEFAULT_CHARACTER_CONTEXT: CharacterContextValue = {
  state: {
    characters: [],
    activeCharacterId: null,
    preferences: {
      language: 'tr',
      ruleset: '2014',
      soundEnabled: true,
      activeCharacterId: null,
      theme: 'dark',
    },
    isLoaded: true,
  },
  activeCharacter: null,
  saveCharacter: () => {},
  deleteCharacter: () => {},
  setActiveCharacter: () => {},
  updateHp: () => {},
  updateSpellSlot: () => {},
  updateConditions: () => {},
  updateDeathSaves: () => {},
  updateInspiration: () => {},
  updatePreferences: () => {},
  exportCharacter: () => {},
  importCharacter: async () => false,
};

// --- Hook ---

export function useCharacter(): CharacterContextValue {
  const ctx = useContext(CharacterContext);
  return ctx ?? DEFAULT_CHARACTER_CONTEXT;
}
