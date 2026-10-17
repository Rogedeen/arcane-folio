/**
 * D&D 5e Karakter Durum ve Avantaj/Dezavantaj Analiz Motoru
 * Referans: SRD 5.1 sf. 62, 75, 78, 176
 *
 * Bu motor; aktif durumları (Conditions), kuşanılan zırh yetkinliğini,
 * gizlilik dezavantajını (Stealth Disadvantage), taşıma yükünü (Encumbrance)
 * ve aktif büyü etkilerini (Bless, Bane vb.) analiz ederek karakter kağıdının
 * en üstünde gösterilecek "Tüm Durumlar & Avantaj/Dezavantaj" panelini besler.
 */

import { checkArmorProficiency } from './proficiency';
import { getDetailedEncumbranceStatus } from './inventory';
import { CONDITIONS } from './conditions';
import type { ItemData } from '../types/content';

export interface CharacterAdvantageState {
  hasStealthDisadvantage: boolean;
  hasAttackDisadvantage: boolean;
  hasAttackAdvantage: boolean;
  hasStrDexCheckDisadvantage: boolean;
  isSpellcastingBlocked: boolean;
  speedPenalty: number;
  tags: Array<{
    id: string;
    labelTr: string;
    labelEn: string;
    type: 'buff' | 'debuff' | 'neutral' | 'restriction';
    descriptionTr: string;
    descriptionEn: string;
    icon: string;
  }>;
}

export function computeCharacterAdvantageState(params: {
  charClass: string;
  strScore: number;
  inventory: ItemData[];
  conditions: string[];
  activeSpells?: string[];
}): CharacterAdvantageState {
  const { charClass, strScore, inventory, conditions, activeSpells = [] } = params;
  const tags: CharacterAdvantageState['tags'] = [];

  let hasStealthDisadvantage = false;
  let hasAttackDisadvantage = false;
  let hasAttackAdvantage = false;
  let hasStrDexCheckDisadvantage = false;
  let isSpellcastingBlocked = false;
  let speedPenalty = 0;

  // 1. Kuşanılan Zırh ve Kalkan Yetkinlik Analizi
  const equippedArmor = inventory.filter((i) => i.equipped && ['armor', 'shield'].includes(i.type));
  for (const item of equippedArmor) {
    const profCheck = checkArmorProficiency(charClass, item.type, item.name);
    if (!profCheck.isProficient) {
      isSpellcastingBlocked = true;
      hasStrDexCheckDisadvantage = true;
      hasAttackDisadvantage = true;
      tags.push({
        id: `non-prof-${item.slug}`,
        labelTr: `Yetkisiz Zırh (${item.name})`,
        labelEn: `Non-Proficient Armor (${item.name})`,
        type: 'restriction',
        descriptionTr: profCheck.reasonTr,
        descriptionEn: profCheck.reasonEn,
        icon: '🚫'
      });
    }

    // Stealth Disadvantage (Chain Mail, Splint, Plate, Padded vb.)
    const nameLower = item.name.toLowerCase();
    if (
      nameLower.includes('chain mail') ||
      nameLower.includes('splint') ||
      nameLower.includes('plate') ||
      nameLower.includes('scale') ||
      nameLower.includes('ring mail') ||
      nameLower.includes('padded')
    ) {
      hasStealthDisadvantage = true;
      tags.push({
        id: `stealth-disadv-${item.slug}`,
        labelTr: 'Gizlilikte Dezavantaj (Ağır Zırh)',
        labelEn: 'Stealth Disadvantage (Armor Noise)',
        type: 'debuff',
        descriptionTr: `${item.name} metal sürtünmesi ve ağırlığı sebebiyle Gizlilik (Stealth) zarlarınız dezavantajlıdır.`,
        descriptionEn: `${item.name} imposes disadvantage on Dexterity (Stealth) checks due to noise.`,
        icon: '🛡️'
      });
    }
  }

  // 2. Taşıma Yükü (Encumbrance)
  const totalWeight = inventory.reduce((sum, it) => sum + it.weight * it.quantity, 0);
  const encStatus = getDetailedEncumbranceStatus(strScore, totalWeight);
  if (encStatus.tier !== 'unencumbered') {
    speedPenalty += encStatus.speedPenalty;
    if (encStatus.hasDisadvantageOnChecks) {
      hasStrDexCheckDisadvantage = true;
    }
    tags.push({
      id: `encumbrance-${encStatus.tier}`,
      labelTr: encStatus.tier === 'over-capacity' ? 'Aşırı Yük (Kapasite Aşıldı)' : encStatus.tier === 'heavily-encumbered' ? 'Çok Ağır Yük' : 'Ağır Yük',
      labelEn: encStatus.tier === 'over-capacity' ? 'Over Capacity' : encStatus.tier === 'heavily-encumbered' ? 'Heavily Encumbered' : 'Encumbered',
      type: 'debuff',
      descriptionTr: `Taşınan ağırlık: ${totalWeight} lbs. Hareket hızı -${encStatus.speedPenalty} ft düşer${encStatus.hasDisadvantageOnChecks ? ' ve STR/DEX/CON kontrollerinde dezavantaj alırsınız.' : '.'}`,
      descriptionEn: `Carrying ${totalWeight} lbs. Speed reduced by -${encStatus.speedPenalty} ft.`,
      icon: '🏋️'
    });
  }

  // 3. Durumlar (Conditions: Blinded, Frightened, Prone, Poisoned vb.)
  for (const condKey of conditions) {
    const def = CONDITIONS[condKey.toLowerCase()];
    if (def) {
      if (def.givesDisadvantageOnAttacks) hasAttackDisadvantage = true;
      if (def.id === 'poisoned') hasAttackDisadvantage = true;
      if (def.id === 'frightened') hasAttackDisadvantage = true;

      tags.push({
        id: `condition-${def.id}`,
        labelTr: def.nameTr,
        labelEn: def.name,
        type: 'debuff',
        descriptionTr: def.effects.join(' '),
        descriptionEn: def.description,
        icon: def.icon
      });
    }
  }

  // 4. Büyü Etkileri (Bless, Bane vb.)
  for (const spell of activeSpells) {
    const lower = spell.toLowerCase();
    if (lower.includes('bless')) {
      tags.push({
        id: 'spell-bless',
        labelTr: 'Bless (Kutsama)',
        labelEn: 'Bless',
        type: 'buff',
        descriptionTr: 'Saldırı zarlarınıza ve kurtarma zarlarınıza +1d4 eklenir.',
        descriptionEn: 'Add +1d4 to attack rolls and saving throws.',
        icon: '✨'
      });
    } else if (lower.includes('bane')) {
      tags.push({
        id: 'spell-bane',
        labelTr: 'Bane (Lanet)',
        labelEn: 'Bane',
        type: 'debuff',
        descriptionTr: 'Saldırı zarlarınızdan ve kurtarma zarlarınızdan 1d4 düşülür.',
        descriptionEn: 'Subtract 1d4 from attack rolls and saving throws.',
        icon: '💀'
      });
    }
  }

  return {
    hasStealthDisadvantage,
    hasAttackDisadvantage,
    hasAttackAdvantage,
    hasStrDexCheckDisadvantage,
    isSpellcastingBlocked,
    speedPenalty,
    tags
  };
}
