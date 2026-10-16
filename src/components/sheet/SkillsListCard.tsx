import React, { useState } from 'react';
import type { FullCharacter } from '../../types/character';
import { SKILLS, calculateSkillModifier } from '../../rules/skills';
import { useCharacter } from '../../context/CharacterContext';
import { getTranslation } from '../../utils/i18n';

interface SkillsListCardProps {
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

export const SkillsListCard: React.FC<SkillsListCardProps> = ({
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
  const [skillFilter, setSkillFilter] = useState<string>('');

  const filteredSkills = SKILLS.filter(
    (sk) =>
      sk.nameTr.toLowerCase().includes(skillFilter.toLowerCase()) ||
      sk.name.toLowerCase().includes(skillFilter.toLowerCase())
  );

  return (
    <section className="dndbeyond-middle-col" id="skills-column">
      <div className="dndbeyond-card" id="skills-list-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="dndbeyond-card-header" style={{ border: 'none', padding: 0, margin: 0 }}>
            {t.skillsHeader}
          </div>
          <input
            type="text"
            placeholder={t.searchSkillPlaceholder}
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            style={{
              width: '80px',
              padding: '0.15rem 0.4rem',
              fontSize: '0.72rem',
              background: '#0a0d16',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              color: '#fff',
            }}
          />
        </div>

        <div className="skills-bento-table" style={{ marginTop: '0.4rem' }}>
          {filteredSkills.map((sk) => {
            const isProf = character.proficientSkills.includes(sk.id);
            const modVal =
              sk.ability === 'str'
                ? strMod
                : sk.ability === 'dex'
                ? dexMod
                : sk.ability === 'con'
                ? conMod
                : sk.ability === 'int'
                ? intMod
                : sk.ability === 'wis'
                ? wisMod
                : chaMod;

            const totalMod = calculateSkillModifier(modVal, isProf, profBonus);
            const displayName = lang === 'tr' ? sk.nameTr : sk.name;

            return (
              <div
                key={sk.id}
                className={`skill-bento-row ${isProf ? 'proficient' : ''}`}
                onClick={() => onRollCheck(lang === 'tr' ? `${displayName} Kontrolü` : `${displayName} Check`, totalMod)}
                title={`${displayName} (1d20 ${totalMod >= 0 ? `+${totalMod}` : totalMod})`}
              >
                <span className="skill-bento-dot">{isProf ? '●' : '○'}</span>
                <span className="skill-bento-mod-tag">{sk.ability.toUpperCase()}</span>
                <span className="skill-bento-name">{displayName}</span>
                <span className="skill-bento-bonus">
                  {totalMod >= 0 ? `+${totalMod}` : totalMod}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
