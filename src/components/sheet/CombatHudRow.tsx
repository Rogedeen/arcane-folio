import React from 'react';
import type { FullCharacter, AbilityName } from '../../types/character';
import { useCharacter } from '../../context/CharacterContext';
import { getTranslation } from '../../utils/i18n';
import { RACE_SPEED } from '../../rules/character';

interface CombatHudRowProps {
  character: FullCharacter;
  speedPenalty?: number;
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
  speedPenalty = 0,
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
  const { state } = useCharacter();
  const lang = state.preferences.language || 'tr';
  const t = getTranslation(lang);

  const abilities: { id: AbilityName; label: string; name: string; val: number; mod: number }[] = [
    { id: 'str', label: t.str, name: t.strength, val: character.baseAbilities.str, mod: strMod },
    { id: 'dex', label: t.dex, name: t.dexterity, val: character.baseAbilities.dex, mod: dexMod },
    { id: 'con', label: t.con, name: t.constitution, val: character.baseAbilities.con, mod: conMod },
    { id: 'int', label: t.int, name: t.intelligence, val: character.baseAbilities.int, mod: intMod },
    { id: 'wis', label: t.wis, name: t.wisdom, val: character.baseAbilities.wis, mod: wisMod },
    { id: 'cha', label: t.cha, name: t.charisma, val: character.baseAbilities.cha, mod: chaMod },
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
            onClick={() => onRollCheck(lang === 'tr' ? `${st.name} Kontrolü` : `${st.name} Check`, st.mod)}
            title={`${st.name} (1d20+${st.mod})`}
          >
            <span className="dndbeyond-stat-label">{st.label}</span>
            <span className="dndbeyond-stat-score" id={`stat-val-${st.id}`}>
              {st.val}
            </span>
            <span className="dndbeyond-stat-mod-pill" id={`stat-mod-${st.id}`}>
              {st.mod >= 0 ? `+${st.mod}` : st.mod}
            </span>
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
          <span className="dndbeyond-stat-label">{t.proficiencyBonus}</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            +{profBonus}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>BONUS</span>
        </div>

        {/* Yürüme Hızı */}
        {(() => {
          const baseSpeed = RACE_SPEED[character.race] ?? 30;
          const effectiveSpeed = Math.max(0, baseSpeed - (speedPenalty || 0));
          const hasPenalty = speedPenalty > 0;

          return (
            <div
              className="dndbeyond-hud-box"
              style={
                hasPenalty
                  ? {
                      borderColor: 'rgba(239, 68, 68, 0.6)',
                      background: 'rgba(239, 68, 68, 0.12)',
                      boxShadow: '0 0 8px rgba(239, 68, 68, 0.25)',
                    }
                  : undefined
              }
              title={
                hasPenalty
                  ? `${lang === 'tr' ? 'Taban Hız' : 'Base Speed'}: ${baseSpeed} ft (${lang === 'tr' ? 'Ceza' : 'Penalty'}: -${speedPenalty} ft)`
                  : `${baseSpeed} ft`
              }
            >
              <span className="dndbeyond-stat-label">{t.speed}</span>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: hasPenalty ? '#f87171' : 'var(--text-primary)',
                }}
              >
                {effectiveSpeed} <span style={{ fontSize: '0.8rem' }}>ft</span>
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  color: hasPenalty ? '#fca5a5' : 'var(--text-muted)',
                  fontWeight: hasPenalty ? 700 : 400,
                }}
              >
                {hasPenalty ? `-${speedPenalty} ft` : t.walking}
              </span>
            </div>
          );
        })()}

        {/* İnisiyatif */}
        <div
          className="dndbeyond-hud-box"
          onClick={() => onRollCheck(t.initiative, dexMod)}
          style={{ cursor: 'pointer', border: '1px solid rgba(212, 175, 53, 0.4)' }}
          title={`${t.initiative} (1d20+DEX)`}
        >
          <span className="dndbeyond-stat-label">{t.initiative}</span>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
            {dexMod >= 0 ? `+${dexMod}` : dexMod}
          </span>
        </div>

        {/* Zırh Sınıfı */}
        <div className="dndbeyond-hud-box" style={{ border: '1px solid rgba(200, 30, 30, 0.4)' }}>
          <span className="dndbeyond-stat-label">{t.armorClass}</span>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff' }} id="sheet-ac-val">
            🛡️ {ac}
          </span>
        </div>

        {/* Heroic Inspiration */}
        <div
          className="dndbeyond-hud-box dndbeyond-inspiration-box"
          title="Heroic Inspiration"
        >
          <span className="dndbeyond-stat-label">{t.inspiration}</span>
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
                title={t.spendInspiration}
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
                {t.spendInspiration}
              </button>
            ) : null}
          </div>
        </div>

        {/* Can Puanı Modülü (HEAL / DAMAGE Butonları & Can) */}
        <div className="dndbeyond-hp-module">
          <div className="dndbeyond-hp-btn-col">
            <button
              className="dndbeyond-hp-mini-btn heal"
              onClick={() => onApplyCustomHp(true)}
              title={t.healBtn}
            >
              {t.healBtn}
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
                MozAppearance: 'textfield',
                appearance: 'textfield',
              }}
            />
            <button
              className="dndbeyond-hp-mini-btn damage"
              onClick={() => onApplyCustomHp(false)}
              title={t.dmgBtn}
            >
              {t.dmgBtn}
            </button>
          </div>

          <div>
            <span className="dndbeyond-stat-label" style={{ display: 'block', marginBottom: '0.15rem' }}>
              {t.hitPoints}
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
