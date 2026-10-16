import React from 'react';
import type { FullCharacter, AbilityName } from '../../types/character';
import { useCharacter } from '../../context/CharacterContext';
import { getTranslation } from '../../utils/i18n';

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
  const { state } = useCharacter();
  const lang = state.preferences.language || 'tr';
  const t = getTranslation(lang);

  const saves: { id: AbilityName; label: string; name: string; mod: number }[] = [
    { id: 'str', label: t.str, name: t.strength, mod: strMod },
    { id: 'int', label: t.int, name: t.intelligence, mod: intMod },
    { id: 'dex', label: t.dex, name: t.dexterity, mod: dexMod },
    { id: 'wis', label: t.wis, name: t.wisdom, mod: wisMod },
    { id: 'con', label: t.con, name: t.constitution, mod: conMod },
    { id: 'cha', label: t.cha, name: t.charisma, mod: chaMod },
  ];

  return (
    <div className="dndbeyond-card" id="saving-throws-box">
      <div className="dndbeyond-card-header">{t.savingThrowsHeader}</div>
      <div className="saving-throws-grid-2col">
        {saves.map((st) => {
          const isProf = character.proficientSavingThrows.includes(st.id);
          const totalSaveMod = isProf ? st.mod + profBonus : st.mod;

          return (
            <div
              key={st.id}
              className={`saving-throw-item ${isProf ? 'proficient' : ''}`}
              onClick={() => onRollCheck(lang === 'tr' ? `${st.name} (${st.label}) Kurtarma Zarı` : `${st.name} (${st.label}) Save`, totalSaveMod)}
              title={`${st.name} Save`}
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
  const { state } = useCharacter();
  const t = getTranslation(state.preferences.language || 'tr');

  return (
    <div className="dndbeyond-card" id="passive-senses-box">
      <div className="dndbeyond-card-header">{t.sensesHeader}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{t.passivePerception}</span>
          <strong style={{ color: 'var(--accent-gold)' }} id="val-passive-perception">
            {passivePerception}
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{t.passiveInvestigation}</span>
          <strong style={{ color: 'var(--accent-gold)' }} id="val-passive-investigation">
            {passiveInvestigation}
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{t.passiveInsight}</span>
          <strong style={{ color: 'var(--accent-gold)' }}>{passiveInsight}</strong>
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {t.darkvision}
        </div>
      </div>
    </div>
  );
};

export const ProficienciesCard: React.FC = () => {
  const { state } = useCharacter();
  const t = getTranslation(state.preferences.language || 'tr');

  return (
    <div className="dndbeyond-card" id="proficiencies-box">
      <div className="dndbeyond-card-header">{t.proficienciesHeader}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{t.armorProf}</strong>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>Light, Medium, Shields</span>
        </div>
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{t.weaponsProf}</strong>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>Simple Weapons, Martial Weapons</span>
        </div>
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{t.toolsProf}</strong>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>Cartographer's Tools, Flute</span>
        </div>
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{t.languagesProf}</strong>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>Common, Elvish / Dwarvish</span>
        </div>
      </div>
    </div>
  );
};
