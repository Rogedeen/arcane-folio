/**
 * D&D 5e Hasar ve İyileşme Fonksiyonları
 * Referans: SRD 5.1 sf. 75, 77 "Temporary Hit Points and Damage"
 */

export function applyDamage(
  currentHp: number,
  tempHp: number,
  damage: number
): { currentHp: number; tempHp: number } {
  if (damage <= 0) {
    return { currentHp, tempHp };
  }

  // Hasar önce Temp HP'den düşer
  let remainingDamage = damage;
  let nextTempHp = tempHp;

  if (nextTempHp > 0) {
    if (remainingDamage <= nextTempHp) {
      nextTempHp -= remainingDamage;
      remainingDamage = 0;
    } else {
      remainingDamage -= nextTempHp;
      nextTempHp = 0;
    }
  }

  // Kalan hasar normal HP'den düşer
  const nextCurrentHp = Math.max(0, currentHp - remainingDamage);

  return {
    currentHp: nextCurrentHp,
    tempHp: nextTempHp
  };
}

export function applyHealing(
  currentHp: number,
  maxHp: number,
  healAmount: number
): number {
  if (healAmount <= 0) {
    return currentHp;
  }
  return Math.min(maxHp, currentHp + healAmount);
}

export function applyTempHp(currentTempHp: number, newTempHp: number): number {
  // Geçici canlar birikmez, en yüksek olan geçerlidir
  return Math.max(currentTempHp, newTempHp);
}
