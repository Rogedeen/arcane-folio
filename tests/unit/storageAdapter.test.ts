import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageAdapter, LocalStorageAdapter } from '../../src/services/storage/LocalStorageAdapter';
import {
  setStorageAdapter,
  loadCharacters,
  saveCharacter,
  deleteCharacter,
  loadPreferences,
  savePreferences,
} from '../../src/data/persistenceService';
import type { FullCharacter } from '../../src/types/character';

describe('StorageAdapter & Persistence (DIP — Dependency Inversion) Testleri', () => {
  let memoryAdapter: MemoryStorageAdapter;

  beforeEach(() => {
    memoryAdapter = new MemoryStorageAdapter();
    setStorageAdapter(memoryAdapter);
  });

  it('MemoryStorageAdapter getItem, setItem ve removeItem doğru çalışır', () => {
    memoryAdapter.setItem('test_key', { foo: 'bar' });
    expect(memoryAdapter.getItem('test_key', null)).toEqual({ foo: 'bar' });

    memoryAdapter.removeItem('test_key');
    expect(memoryAdapter.getItem('test_key', 'fallback')).toBe('fallback');
  });

  it('PersistenceService soyutlanmış adapter üzerinden karakter kaydedip siler', () => {
    const testChar: FullCharacter = {
      id: 'char-test-1',
      name: 'Test Kahraman',
      race: 'elf',
      class: 'ranger',
      background: 'outlander',
      level: 1,
      baseAbilities: { str: 10, dex: 16, con: 12, int: 10, wis: 14, cha: 10 },
      proficientSkills: ['stealth'],
      proficientSavingThrows: ['str', 'dex'],
      hasShield: false,
      currentHp: 11,
      maxHp: 11,
      tempHp: 0,
      hitDiceAvailable: 1,
      weapons: [],
      spellSlots: {},
      activeConditions: [],
      ruleset: '2014',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveCharacter(testChar);
    const chars = loadCharacters();
    expect(chars).toHaveLength(1);
    expect(chars[0].name).toBe('Test Kahraman');

    deleteCharacter('char-test-1');
    expect(loadCharacters()).toHaveLength(0);
  });

  it('PersistenceService tercihler yükleme ve kaydetme adapter üzerinden çalışır', () => {
    const updated = savePreferences({ soundEnabled: false, language: 'en' });
    expect(updated.soundEnabled).toBe(false);
    expect(updated.language).toBe('en');

    const loaded = loadPreferences();
    expect(loaded.soundEnabled).toBe(false);
    expect(loaded.language).toBe('en');
  });

  it('LocalStorageAdapter varsayılan olarak tanımlıdır ve güvenli çalışır', () => {
    const localAdapter = new LocalStorageAdapter();
    expect(localAdapter.getItem('non_existent', 'default')).toBe('default');
  });
});
