import { describe, it, expect } from 'vitest';
import { getStarterKitForClass } from '../../src/rules/starterEquipment';

describe('StarterEquipment Kit Generator Testleri', () => {
  it('Fighter için başlangıç kiti ve zırhı doğru üretir', () => {
    const kit = getStarterKitForClass(
      'fighter',
      { name: 'Scale Mail', type: 'medium', baseAc: 14 },
      true
    );

    expect(kit.weapons).toHaveLength(1);
    expect(kit.weapons[0].name).toContain('Longsword');
    expect(kit.equippedArmor?.name).toBe('Scale Mail');
    expect(kit.hasShield).toBe(true);

    // Envanterde tüm oyun kataloğu değil, sadece başlangıç kiti eşyaları olmalı
    const itemNames = kit.inventory.map((i) => i.name);
    expect(itemNames).toContain('Uzunkılıç (Longsword)');
    expect(itemNames).toContain('Kalkan (Shield)');
    expect(itemNames).toContain('Scale Mail');
    expect(itemNames).toContain('Potion of Healing');
    expect(itemNames).toContain('Sırt Çantası (Backpack)');

    // Kataloğun geri kalanı (Plate armor, rapier vb.) bu savaşçının çantasında olmamalı!
    expect(itemNames).not.toContain('Tam Plaka Zırh (Plate)');
    expect(itemNames).not.toContain('Meç (Rapier)');
  });

  it('Rogue için rapier, hançer çifti ve hırsız aletlerini verir', () => {
    const kit = getStarterKitForClass('rogue', undefined, false);
    const itemSlugs = kit.inventory.map((i) => i.slug);

    expect(itemSlugs).toContain('rapier');
    expect(itemSlugs).toContain('dagger-pair');
    expect(itemSlugs).toContain('thieves-tools');
    expect(itemSlugs).not.toContain('greataxe');
  });

  it('Wizard için asa, büyü odağı ve iksir verir', () => {
    const kit = getStarterKitForClass('wizard', undefined, false);
    const itemSlugs = kit.inventory.map((i) => i.slug);

    expect(itemSlugs).toContain('quarterstaff');
    expect(itemSlugs).toContain('arcane-focus');
    expect(itemSlugs).toContain('potion-of-healing');
  });
});
