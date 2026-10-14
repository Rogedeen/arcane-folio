/**
 * SRD 5.1 Ölüm Kurtarma Zarları (Death Saving Throws)
 */

export interface DeathSavesState {
  successes: number; // 0..3
  failures: number;  // 0..3
  isDead: boolean;
  isStable: boolean;
  regainedHp?: number;
  lastRoll?: number;
  message?: string;
}

export const INITIAL_DEATH_SAVES: DeathSavesState = {
  successes: 0,
  failures: 0,
  isDead: false,
  isStable: false
};

/**
 * Bir d20 ölüm kurtarma zarı sonucunu işler
 * @param roll 1 ile 20 arasında zar değeri
 * @param currentState Mevcut ölüm zarı durumu
 */
export function processDeathSaveRoll(roll: number, currentState: DeathSavesState): DeathSavesState {
  if (currentState.isDead || currentState.isStable) {
    return currentState;
  }

  // Doğal 20: 1 HP ile anında bilince kavuşur!
  if (roll === 20) {
    return {
      successes: 0,
      failures: 0,
      isDead: false,
      isStable: true,
      regainedHp: 1,
      lastRoll: 20,
      message: 'DOĞAL 20! Mucizevi bir şekilde 1 Can ile bilincine kavuştun!'
    };
  }

  // Doğal 1: Kritik Hata = 2 Başarısızlık sayılır!
  if (roll === 1) {
    const nextFailures = Math.min(3, currentState.failures + 2);
    const isDead = nextFailures >= 3;
    return {
      ...currentState,
      failures: nextFailures,
      isDead,
      lastRoll: 1,
      message: isDead ? 'Kritik 1! 2 Başarısızlık eklendi. Karakter HAYATINI KAYBETTİ 💀' : 'Kritik 1! 2 Başarısızlık eklendi!'
    };
  }

  // 10 - 19: Başarı (+1 Success)
  if (roll >= 10) {
    const nextSuccesses = Math.min(3, currentState.successes + 1);
    const isStable = nextSuccesses >= 3;
    return {
      ...currentState,
      successes: nextSuccesses,
      isStable,
      lastRoll: roll,
      message: isStable ? '3. Başarı! Durum dengelendi (Stabilize), ölüm tehlikesi geçti.' : `Başarılı Kurtarma (${roll})! (+1 Başarı)`
    };
  }

  // 2 - 9: Başarısızlık (+1 Failure)
  const nextFailures = Math.min(3, currentState.failures + 1);
  const isDead = nextFailures >= 3;
  return {
    ...currentState,
    failures: nextFailures,
    isDead,
    lastRoll: roll,
    message: isDead ? `Başarısız Zar (${roll}). 3 Başarısızlık oldu. Karakter HAYATINI KAYBETTİ 💀` : `Başarısız Kurtarma (${roll})! (+1 Başarısızlık)`
  };
}

/**
 * 0 Can durumundayken hasar alındığında ölüm zarı etkisi
 * Normal hasar: 1 failure. Kritik hasar: 2 failure.
 */
export function applyDamageWhileDying(currentState: DeathSavesState, isCritical: boolean = false): DeathSavesState {
  const penalty = isCritical ? 2 : 1;
  const nextFailures = Math.min(3, currentState.failures + penalty);
  return {
    ...currentState,
    failures: nextFailures,
    isDead: nextFailures >= 3,
    message: `0 Candayken hasar alındı! (+${penalty} Başarısızlık)`
  };
}
