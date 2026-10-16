import React from 'react';
import type { FullCharacter, AbilityName } from '../../types/character';

interface SavingThrowsCardProps {
  character: FullCharacter;
  strMod: number;
  dexMod: number;
  conMod: number;
  intMod: number;
  wisMod: number;
  chaMod: number;
  profBonus: number;
  onRollCheck: (label: string, mod: number) => void;
}

export const SavingThrowsCard: React.FC<SavingThrowsCardProps> = ({
  character,
  strMod,
  dexMod,
  conMod,
  intMod,
  wisMod,
  chaMod,
  profBonus,
  onRollCheck,
}) => {
  const saves: { id: AbilityName; label: string; name: string; mod: number }[] = [
    { id: 'str', label: 'STR', name: 'Güç', mod: strMod },
    { id: 'int', label: 'INT', name: 'Zeka', mod: intMod },
    { id: 'dex', label: 'DEX', name: 'Çeviklik', mod: dexMod },
    { id: 'wis', label: 'WIS', name: 'Bilgelik', mod: wisMod },
    { id: 'con', label: 'CON', name: 'Dayanıklılık', mod: conMod },
    { id: 'cha', label: 'CHA', name: 'Karizma', mod: chaMod },
  ];

  return (
    <div className="dndbeyond-card" id="saving-throws-box">
      <div className="dndbeyond-card-header">SAVING THROWS (Kurtarma Zarları)</div>
      <div className="saving-throws-grid-2col">
        {saves.map((st) => {
          const isProf = character.proficientSavingThrows.includes(st.id);
          const totalSaveMod = isProf ? st.mod + profBonus : st.mod;

          return (
            <div
              key={st.id}
              className={`saving-throw-item ${isProf ? 'proficient' : ''}`}
              onClick={() => onRollCheck(`${st.name} (${st.label}) Kurtarma Zarı`, totalSaveMod)}
              title={`${st.name} Kurtarma Zarı At`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="st-dot">{isProf ? '●' : '○'}</span>
                <span style={{ fontWeight: isProf ? 800 : 500 }}>{st.label}</span>
              </div>
              <strong style={{ color: isProf ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                {totalSaveMod >= 0 ? `+${totalSaveMod}` : totalSaveMod}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface SensesCardProps {
  passivePerception: number;
  passiveInvestigation: number;
  passiveInsight: number;
}

export const SensesCard: React.FC<SensesCardProps> = ({
  passivePerception,
  passiveInvestigation,
  passiveInsight,
}) => {
  return (
    <div className="dndbeyond-card" id="passive-senses-box">
      <div className="dndbeyond-card-header">SENSES (Duyular & Algı)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Passive Perception:</span>
          <strong style={{ color: 'var(--accent-gold)' }} id="val-passive-perception">
            {passivePerception}
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Passive Investigation:</span>
          <strong style={{ color: 'var(--accent-gold)' }} id="val-passive-investigation">
            {passiveInvestigation}
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Passive Insight:</span>
          <strong style={{ color: 'var(--accent-gold)' }}>{passiveInsight}</strong>
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          🌙 Darkvision: 60 ft.
        </div>
      </div>
    </div>
  );
};

export const ProficienciesCard: React.FC = () => {
  return (
    <div className="dndbeyond-card" id="proficiencies-box">
      <div className="dndbeyond-card-header">PROFICIENCIES (Eğitimler)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Armor:</strong>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>Light, Medium, Shields</span>
        </div>
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Weapons:</strong>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>Simple Weapons, Martial Weapons</span>
        </div>
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Tools:</strong>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>Cartographer's Tools, Flute</span>
        </div>
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Languages:</strong>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>Common, Elvish / Dwarvish</span>
        </div>
      </div>
    </div>
  );
};
