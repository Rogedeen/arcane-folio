import React, { useState } from 'react';
import type { FullCharacter } from '../../types/character';
import { SKILLS, calculateSkillModifier } from '../../rules/skills';

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
            SKILLS (Beceriler)
          </div>
          <input
            type="text"
            placeholder="Ara..."
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

            return (
              <div
                key={sk.id}
                className={`skill-bento-row ${isProf ? 'proficient' : ''}`}
                onClick={() => onRollCheck(`${sk.nameTr} (${sk.name}) Kontrolü`, totalMod)}
                title={`${sk.nameTr} Zarı At (1d20 ${totalMod >= 0 ? `+${totalMod}` : totalMod})`}
              >
                <span className="skill-bento-dot">{isProf ? '●' : '○'}</span>
                <span className="skill-bento-mod-tag">{sk.ability.toUpperCase()}</span>
                <span className="skill-bento-name">{sk.nameTr}</span>
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
