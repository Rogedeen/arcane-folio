/**
 * D&D 5e Konsantrasyon (Concentration) Kural Motoru
 * Referans: SRD 5.1 sf. 54 "Concentration"
 *
 * Kurallar:
 * 1. Bir karakter aynı anda yalnızca TEK BİR konsantrasyon büyüsü sürdürebilir.
 * 2. Konsantrasyon gerektiren yeni bir büyü atıldığında, önceki büyü otomatik olarak sona erer.
 * 3. Hasar alındığında, konsantrasyonun bozulmaması için Constitution Kurtulma Zarı (CON Save) atılır:
 *    DC = max(10, floor(alınan_hasar / 2)).
 * 4. Karakter Incapacitated duruma düşerse veya ölürse konsantrasyon anında sonlanır.
 */

export interface ActiveConcentration {
  spellSlug: string;
  spellName: string;
  castAtLevel: number;
  startedAtTimestamp: number;
}

/**
 * Hasar alındığında atılması gereken Konsantrasyon DC değerini hesaplar.
 * Formül: max(10, floor(damage / 2))
 */
export function calculateConcentrationDC(damageTaken: number): number {
  if (damageTaken <= 0) return 10;
  return Math.max(10, Math.floor(damageTaken / 2));
}

/**
 * Yeni bir konsantrasyon büyüsü başlatıldığında mevcut konsantrasyon durumunu yönetir.
 * Eğer zaten aktif bir büyü varsa eskisini düşürüp yenisini aktif eder.
 */
export function startConcentration(
  current: ActiveConcentration | null,
  newSpell: { slug: string; name: string; level: number }
): {
  newConcentration: ActiveConcentration;
  previousBrokenSpellName: string | null;
} {
  const previousBrokenSpellName = current ? current.spellName : null;

  const newConcentration: ActiveConcentration = {
    spellSlug: newSpell.slug,
    spellName: newSpell.name,
    castAtLevel: newSpell.level,
    startedAtTimestamp: Date.now()
  };

  return {
    newConcentration,
    previousBrokenSpellName
  };
}

/**
 * Karakter Incapacitated / 0 HP olduğunda konsantrasyonun düşmesi gerekir.
 */
export function checkConcentrationLossOnCondition(
  conditions: string[],
  currentHp: number
): boolean {
  if (currentHp <= 0) return true;
  const lowerConditions = conditions.map((c) => c.toLowerCase());
  return lowerConditions.some((c) =>
    ['incapacitated', 'unconscious', 'paralyzed', 'petrified', 'stunned', 'baygın', 'felç'].includes(c)
  );
}
