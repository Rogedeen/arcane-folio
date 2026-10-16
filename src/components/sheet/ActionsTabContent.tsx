import React from 'react';
import type { WeaponItem } from '../../types/character';

export type ActionSubPill = 'all' | 'attack' | 'action' | 'bonus' | 'reaction';

interface ActionsTabContentProps {
  weapons: WeaponItem[];
  strMod: number;
  dexMod: number;
  profBonus: number;
  damageAnimState: Record<string, { isRolling: boolean; labelText: string; ghostVal: string | null }>;
  actionSubPill: ActionSubPill;
  onChangeActionSubPill: (pill: ActionSubPill) => void;
  onRollCheck: (label: string, mod: number) => void;
  onAnimatedDamageRoll: (weapon: WeaponItem, abilityMod: number) => void;
  onOpenReference: (params: { type: 'item'; data: any }) => void;
}

export const ActionsTabContent: React.FC<ActionsTabContentProps> = ({
  weapons,
  strMod,
  dexMod,
  profBonus,
  damageAnimState,
  actionSubPill,
  onChangeActionSubPill,
  onRollCheck,
  onAnimatedDamageRoll,
  onOpenReference,
}) => {
  const pills: ActionSubPill[] = ['all', 'attack', 'action', 'bonus', 'reaction'];

  return (
    <div id="tab-content-actions" className="dndbeyond-card">
      {/* Alt Filtre Hapları */}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {pills.map((pill) => (
          <button
            key={pill}
            onClick={() => onChangeActionSubPill(pill)}
            style={{
              background: actionSubPill === pill ? 'var(--accent-red)' : 'rgba(255,255,255,0.05)',
              color: actionSubPill === pill ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '4px',
              padding: '0.2rem 0.55rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {pill.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Attacks Tablosu */}
      <div style={{ overflowX: 'auto' }}>
        <table className="attacks-bento-table">
          <thead>
            <tr>
              <th>ATTACK</th>
              <th>RANGE</th>
              <th>HIT / DC</th>
              <th>DAMAGE</th>
              <th>NOTES</th>
            </tr>
          </thead>
          <tbody>
            {weapons.map((w) => {
              const abilityMod = w.abilityUsed === 'str' ? strMod : dexMod;
              const toHitMod = abilityMod + profBonus;
              const anim = damageAnimState[w.id];

              return (
                <tr key={w.id}>
                  <td>
                    <strong
                      style={{ color: 'var(--text-primary)', display: 'block', cursor: 'pointer' }}
                      onClick={() =>
                        onOpenReference({
                          type: 'item',
                          data: {
                            slug: w.id,
                            name: w.name,
                            type: 'weapon',
                            cost: '15 gp',
                            weight: 3,
                            description: `${w.damage} ${w.damageType}. Özellikler: ${w.properties?.join(', ') || 'Standard'}. Menzil: ${w.range ?? '5 ft'}.`,
                            quantity: 1,
                            source: 'PHB',
                            source_ref: 'PHB',
                            license: 'OGL',
                          },
                        })
                      }
                      title="Detayları İncele (Reference Drawer)"
                    >
                      {w.name}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Melee Weapon • Mastery
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{w.range ?? '5 ft'}</td>
                  <td>
                    <button
                      id={`btn-attack-${w.id}`}
                      className="dndbeyond-attack-box-btn"
                      onClick={() => onRollCheck(`${w.name} Saldırısı`, toHitMod)}
                      title="1d20+Bonus ile Saldırı Yap"
                    >
                      {toHitMod >= 0 ? `+${toHitMod}` : toHitMod}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <button
                        id={`btn-damage-${w.id}`}
                        className={`dndbeyond-attack-box-btn damage-active-btn ${anim?.isRolling ? 'rolling' : ''}`}
                        style={{ background: 'rgba(200, 30, 30, 0.25)', borderColor: 'var(--accent-red)' }}
                        onClick={() => onAnimatedDamageRoll(w, abilityMod)}
                        disabled={anim?.isRolling}
                        title="Hasar Zarı At"
                      >
                        💥 {anim?.labelText || `${w.damage}+${abilityMod}`}
                      </button>
                      {anim?.ghostVal && (
                        <span className="damage-prev-result-ghost">
                          [{anim.ghostVal}]
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {w.properties?.join(', ') || 'Standard'} • {w.damageType}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dövüş İçi Standart Eylemler (Actions in Combat) */}
      <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-gold)' }}>ACTIONS IN COMBAT</span>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.3rem 0' }}>
          Attack, Dash, Disengage, Dodge, Grapple, Help, Hide, Improvise, Influence, Ready, Search, Shove, Study, Utilize.
        </p>
      </div>
    </div>
  );
};
