import React from 'react';
import type { FullCharacter, AbilityName } from '../../types/character';

interface CombatHudRowProps {
  character: FullCharacter;
  strMod: number;
  dexMod: number;
  conMod: number;
  intMod: number;
  wisMod: number;
  chaMod: number;
  profBonus: number;
  ac: number;
  isLocked: boolean;
  customHpInput: string;
  onChangeCustomHpInput: (val: string) => void;
  onApplyCustomHp: (isHealing: boolean) => void;
  onStatChange: (stat: keyof FullCharacter['baseAbilities'], delta: number) => void;
  onRollCheck: (label: string, mod: number) => void;
  onUpdateInspiration: (count: number) => void;
}

export const CombatHudRow: React.FC<CombatHudRowProps> = ({
  character,
  strMod,
  dexMod,
  conMod,
  intMod,
  wisMod,
  chaMod,
  profBonus,
  ac,
  isLocked,
  customHpInput,
  onChangeCustomHpInput,
  onApplyCustomHp,
  onStatChange,
  onRollCheck,
  onUpdateInspiration,
}) => {
  const abilities: { id: AbilityName; label: string; name: string; val: number; mod: number }[] = [
    { id: 'str', label: 'STRENGTH', name: 'Güç', val: character.baseAbilities.str, mod: strMod },
    { id: 'dex', label: 'DEXTERITY', name: 'Çeviklik', val: character.baseAbilities.dex, mod: dexMod },
    { id: 'con', label: 'CONSTITUTION', name: 'Dayanıklılık', val: character.baseAbilities.con, mod: conMod },
    { id: 'int', label: 'INTELLIGENCE', name: 'Zeka', val: character.baseAbilities.int, mod: intMod },
    { id: 'wis', label: 'WISDOM', name: 'Bilgelik', val: character.baseAbilities.wis, mod: wisMod },
    { id: 'cha', label: 'CHARISMA', name: 'Karizma', val: character.baseAbilities.cha, mod: chaMod },
  ];

  return (
    <section className="dndbeyond-hud-row" id="combat-hud-row">
      {/* 6'lı Yetenek Skorları Bandı */}
      <div className="dndbeyond-abilities-band" id="ability-scores-column">
        {abilities.map((st) => (
          <div
            key={st.id}
            className="dndbeyond-stat-badge"
            id={`ability-box-${st.id}`}
            onClick={() => onRollCheck(`${st.name} (${st.label}) Kontrolü`, st.mod)}
            title={`${st.name} Zarı At (1d20+${st.mod})`}
          >
            <span className="dndbeyond-stat-label">{st.label.slice(0, 3)}</span>
            <span className="dndbeyond-stat-mod">
              {st.mod >= 0 ? `+${st.mod}` : st.mod}
            </span>
            <span className="dndbeyond-stat-score-pill">{st.val}</span>
            {!isLocked && (
              <div className="unlocked-stat-stepper" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => onStatChange(st.id, -1)}>-</button>
                <button onClick={() => onStatChange(st.id, +1)}>+</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Savaş Göstergeleri: Ustalık, Hız, İnisiyatif, AC, Can Barı */}
      <div className="dndbeyond-combat-hud-group">
        {/* Ustalık Bonusu */}
        <div className="dndbeyond-hud-box">
          <span className="dndbeyond-stat-label">PROFICIENCY</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            +{profBonus}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>BONUS</span>
        </div>

        {/* Yürüme Hızı */}
        <div className="dndbeyond-hud-box">
          <span className="dndbeyond-stat-label">SPEED</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            30 <span style={{ fontSize: '0.8rem' }}>ft</span>
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>WALKING</span>
        </div>

        {/* İnisiyatif (Elmas Şekli) */}
        <div
          className="dndbeyond-hud-box"
          onClick={() => onRollCheck('İnisiyatif', dexMod)}
          style={{ cursor: 'pointer', border: '1px solid rgba(212, 175, 53, 0.4)' }}
          title="İnisiyatif Zarı At (1d20+DEX)"
        >
          <span className="dndbeyond-stat-label">INITIATIVE</span>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
            {dexMod >= 0 ? `+${dexMod}` : dexMod}
          </span>
        </div>

        {/* Zırh Sınıfı (Kalkan Şekli) */}
        <div className="dndbeyond-hud-box" style={{ border: '1px solid rgba(200, 30, 30, 0.4)' }}>
          <span className="dndbeyond-stat-label">ARMOR CLASS</span>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff' }} id="sheet-ac-val">
            🛡️ {ac}
          </span>
        </div>

        {/* Heroic Inspiration (Stacklenebilir İlham) */}
        <div
          className="dndbeyond-hud-box dndbeyond-inspiration-box"
          title="Heroic Inspiration (Stacklenebilir İlham)"
        >
          <span className="dndbeyond-stat-label">INSPIRATION</span>
          <div className="inspiration-content-row">
            <span className="inspiration-icon">✨</span>
            <span className="inspiration-count-val" id="sheet-inspiration-val">
              {character.inspiration ?? 0}
            </span>
          </div>
          <div className="unlocked-stat-stepper" style={{ marginTop: '0.15rem' }}>
            {(character.inspiration ?? 0) > 0 ? (
              <button
                type="button"
                id="btn-inspiration-dec"
                onClick={() => onUpdateInspiration(Math.max(0, (character.inspiration ?? 0) - 1))}
                title="1 İlham Harca (Zar avantajı için kullan)"
                style={{
                  background: 'rgba(217, 119, 6, 0.3)',
                  border: '1px solid #f59e0b',
                  color: '#fbbf24',
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Harca (-1)
              </button>
            ) : (
              <span
                style={{
                  fontSize: '0.62rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.04em',
                }}
                title="İlham yalnızca Zindan Efendisi (DM) tarafından verilebilir"
              >
                DM ÖDÜLÜ
              </span>
            )}
          </div>
        </div>

        {/* Can Puanı Modülü (HEAL / DAMAGE Butonları & Can) */}
        <div className="dndbeyond-hp-module">
          <div className="dndbeyond-hp-btn-col">
            <button
              className="dndbeyond-hp-mini-btn heal"
              onClick={() => onApplyCustomHp(true)}
              title="Can Ver"
            >
              HEAL
            </button>
            <input
              type="number"
              placeholder="±"
              value={customHpInput}
              onChange={(e) => onChangeCustomHpInput(e.target.value)}
              style={{
                width: '42px',
                padding: '0.1rem',
                fontSize: '0.75rem',
                background: '#090d16',
                border: '1px solid #334155',
                color: '#fff',
                borderRadius: '3px',
                textAlign: 'center',
              }}
            />
            <button
              className="dndbeyond-hp-mini-btn damage"
              onClick={() => onApplyCustomHp(false)}
              title="Hasar Ver"
            >
              DMG
            </button>
          </div>

          <div>
            <span className="dndbeyond-stat-label" style={{ display: 'block', marginBottom: '0.15rem' }}>
              HIT POINTS
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
              <strong style={{ fontSize: '1.35rem', color: character.currentHp <= 5 ? '#ef4444' : '#22c55e' }}>
                {character.currentHp}
              </strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ {character.maxHp}</span>
              {character.tempHp > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>(+{character.tempHp})</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
