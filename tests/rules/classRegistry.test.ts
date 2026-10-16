import { describe, it, expect } from 'vitest';
import { classRegistry, type ClassDefinition } from '../../src/rules/classRegistry';

describe('ClassRegistry (OCP — Open/Closed Principle) Testleri', () => {
  it('Standart 12 sınıfı ve hit die değerlerini doğru getirir', () => {
    expect(classRegistry.getHitDie('fighter')).toBe(10);
    expect(classRegistry.getHitDie('wizard')).toBe(6);
    expect(classRegistry.getHitDie('barbarian')).toBe(12);
    expect(classRegistry.getHitDie('rogue')).toBe(8);
  });

  it('Büyücü olup olmadığını sınıf ve alt sınıfa göre doğru belirler', () => {
    // Fighter normalde caster değil
    expect(classRegistry.isCaster('fighter')).toBe(false);
    expect(classRegistry.isCaster('fighter', 'champion')).toBe(false);

    // Eldritch Knight seçilince caster olmalı (Modüler Caster Kuralı)
    expect(classRegistry.isCaster('fighter', 'eldritchKnight')).toBe(true);

    // Rogue normalde caster değil, Arcane Trickster caster
    expect(classRegistry.isCaster('rogue')).toBe(false);
    expect(classRegistry.isCaster('rogue', 'arcaneTrickster')).toBe(true);

    // Wizard her halükarda caster
    expect(classRegistry.isCaster('wizard')).toBe(true);
  });

  it('Kurtarma zarlarını (Saving Throws) sınıfa göre doğru döndürür', () => {
    expect(classRegistry.getSavingThrows('fighter')).toEqual(['str', 'con']);
    expect(classRegistry.getSavingThrows('wizard')).toEqual(['int', 'wis']);
  });

  it('Yeni bir Homebrew sınıf (örn. Artificer) switch-case değiştirmeden dinamik kaydedilebilir (OCP)', () => {
    const artificer: ClassDefinition = {
      id: 'artificer',
      name: 'Artificer',
      nameTr: 'Simyager / Mucit',
      hitDie: 8,
      primaryAbility: 'int',
      savingThrows: ['con', 'int'],
      isCaster: true,
      spellcastingAbility: 'int',
      description: 'Büyülü icatlar ve mekanik tılsımlar üreten deha.',
    };

    classRegistry.registerClass(artificer);

    expect(classRegistry.getClass('artificer')).toBeDefined();
    expect(classRegistry.getHitDie('artificer')).toBe(8);
    expect(classRegistry.isCaster('artificer')).toBe(true);
    expect(classRegistry.getSavingThrows('artificer')).toEqual(['con', 'int']);
  });
});
