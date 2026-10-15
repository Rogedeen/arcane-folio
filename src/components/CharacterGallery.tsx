// =============================================================================
// CHARACTER GALLERY — V3
// Kayıtlı tüm karakterleri kart olarak gösteren galeri ekranı.
// Karakter seçme, silme, dışa aktarma ve yeni karakter oluşturma buradan.
// =============================================================================

import React, { useState, useRef } from 'react';
import { useCharacter } from '../context/CharacterContext';
import type { FullCharacter } from '../types/character';

// Sınıfa göre emoji
const CLASS_ICON: Record<string, string> = {
  barbarian: '⚔️',
  bard: '🎵',
  cleric: '✨',
  druid: '🌿',
  fighter: '🛡️',
  monk: '🥷',
  paladin: '⚜️',
  ranger: '🏹',
  rogue: '🗡️',
  sorcerer: '🔮',
  warlock: '👁️',
  wizard: '📚',
};

// Sınıf isimleri (Türkçe)
const CLASS_NAME_TR: Record<string, string> = {
  barbarian: 'Barbar',
  bard: 'Ozan',
  cleric: 'Rahip',
  druid: 'Druid',
  fighter: 'Savaşçı',
  monk: 'Keşiş',
  paladin: 'Paladin',
  ranger: 'Kolcu',
  rogue: 'Hırsız',
  sorcerer: 'Büyücü',
  warlock: 'Warlock',
  wizard: 'İlimci',
};

// Irk isimleri (kısa Türkçe)
const RACE_NAME_TR: Record<string, string> = {
  human: 'İnsan',
  elf: 'Elf',
  dwarf: 'Cüce',
  halfling: 'Buçukluk',
  dragonborn: 'Ejderhadölü',
  gnome: 'Gnom',
  'half-elf': 'Yarı-Elf',
  'half-orc': 'Yarı-Ork',
  tiefling: 'Tiefling',
};

// Avatar arka plan renkleri (class'a göre)
const CLASS_COLORS: Record<string, string> = {
  barbarian: '#dc2626',
  bard: '#7c3aed',
  cleric: '#d97706',
  druid: '#16a34a',
  fighter: '#2563eb',
  monk: '#0891b2',
  paladin: '#ea580c',
  ranger: '#65a30d',
  rogue: '#475569',
  sorcerer: '#9333ea',
  warlock: '#4c1d95',
  wizard: '#1d4ed8',
};

// HP yüzdesine göre renk
function hpColor(current: number, max: number): string {
  if (max <= 0) return '#64748b';
  const pct = current / max;
  if (pct <= 0) return '#ef4444';
  if (pct < 0.3) return '#f97316';
  if (pct < 0.6) return '#eab308';
  return '#22c55e';
}

interface CharacterCardProps {
  character: FullCharacter;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onExport: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isActive,
  onSelect,
  onDelete,
  onExport,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const hpPct =
    character.maxHp > 0 ? (character.currentHp / character.maxHp) * 100 : 0;
  const avatarColor = CLASS_COLORS[character.class] ?? '#334155';
  const classIcon = CLASS_ICON[character.class] ?? '⚔️';
  const classTr = CLASS_NAME_TR[character.class] ?? character.class;
  const raceTr = RACE_NAME_TR[character.race] ?? character.race;

  return (
    <div
      className={`char-gallery-card ${isActive ? 'active' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      aria-label={`${character.name} karakterini seç`}
    >
      {/* Avatar */}
      <div
        className="char-card-avatar"
        style={{ background: `linear-gradient(135deg, ${avatarColor}cc, ${avatarColor}66)` }}
      >
        <span className="char-card-avatar-icon">{classIcon}</span>
        <span className="char-card-avatar-initial">{character.name.charAt(0).toUpperCase()}</span>
      </div>

      {/* Bilgi */}
      <div className="char-card-info">
        <h3 className="char-card-name font-cinzel">{character.name}</h3>
        <div className="char-card-meta">
          <span className="char-card-badge" style={{ color: avatarColor }}>
            Svye {character.level} {classTr}
          </span>
          {character.subclass && (
            <span className="char-card-subclass">({character.subclass})</span>
          )}
          <span className="char-card-race">• {raceTr}</span>
        </div>

        {/* HP Bar */}
        <div className="char-card-hp-row">
          <div className="char-card-hp-bar-wrap">
            <div
              className="char-card-hp-bar-fill"
              style={{
                width: `${Math.max(0, Math.min(100, hpPct))}%`,
                background: hpColor(character.currentHp, character.maxHp),
              }}
            />
          </div>
          <span
            className="char-card-hp-text"
            style={{ color: hpColor(character.currentHp, character.maxHp) }}
          >
            {character.currentHp}/{character.maxHp} HP
          </span>
        </div>

        {/* Aktif Durumlar */}
        {character.activeConditions.length > 0 && (
          <div className="char-card-conditions">
            {character.activeConditions.slice(0, 3).map((c, i) => (
              <span key={i} className="char-card-condition-chip">
                {c}
              </span>
            ))}
            {character.activeConditions.length > 3 && (
              <span className="char-card-condition-chip muted">
                +{character.activeConditions.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Menü Butonu */}
      <div
        className="char-card-menu-wrap"
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu((v) => !v);
        }}
      >
        <button className="char-card-menu-btn" aria-label="Karakter seçenekleri">
          ⋮
        </button>
        {showMenu && (
          <div className="char-card-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExport();
                setShowMenu(false);
              }}
            >
              📥 Dışa Aktar (JSON)
            </button>
            <button
              className="danger"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`"${character.name}" karakterini silmek istiyor musun?`)) {
                  onDelete();
                }
                setShowMenu(false);
              }}
            >
              🗑️ Sil
            </button>
          </div>
        )}
      </div>

      {/* Aktif rozetleri */}
      {isActive && (
        <div className="char-card-active-badge">AKTİF</div>
      )}
    </div>
  );
};

// =============================================================================
// Yeni Karakter Kartı (+ butonu)
// =============================================================================

interface NewCharCardProps {
  onNew: () => void;
  onImport: (file: File) => void;
}

const NewCharCard: React.FC<NewCharCardProps> = ({ onNew, onImport }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="char-gallery-card new-card">
      <button
        id="btn-create-new-character"
        className="new-char-btn"
        onClick={onNew}
        aria-label="Yeni karakter oluştur"
      >
        <span className="new-char-plus">+</span>
        <span className="font-cinzel new-char-label">Yeni Karakter</span>
        <span className="new-char-sub">SRD 5.1 kural motoru ile</span>
      </button>

      <div className="import-divider">veya</div>

      <button
        className="import-char-btn"
        onClick={() => fileRef.current?.click()}
        aria-label="JSON'dan karakter içe aktar"
      >
        📂 JSON'dan İçe Aktar
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImport(file);
          e.target.value = '';
        }}
      />
    </div>
  );
};

// =============================================================================
// Ana Galeri Bileşeni
// =============================================================================

interface CharacterGalleryProps {
  onOpenSheet: () => void;
  onCreateNew: () => void;
}

export const CharacterGallery: React.FC<CharacterGalleryProps> = ({
  onOpenSheet,
  onCreateNew,
}) => {
  const { state, activeCharacter, setActiveCharacter, deleteCharacter, exportCharacter, importCharacter } =
    useCharacter();

  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleSelect = (char: FullCharacter) => {
    setActiveCharacter(char.id);
    // Kısa bir delay sonra karakter kağıdını aç
    setTimeout(() => onOpenSheet(), 150);
  };

  const handleImport = async (file: File) => {
    setImportError(null);
    const ok = await importCharacter(file);
    if (ok) {
      setImportSuccess('Karakter başarıyla içe aktarıldı!');
      setTimeout(() => setImportSuccess(null), 3000);
    } else {
      setImportError('Geçersiz karakter dosyası. Lütfen doğru JSON formatını kullan.');
      setTimeout(() => setImportError(null), 4000);
    }
  };

  return (
    <div id="character-gallery-container" className="char-gallery-root">
      {/* Başlık */}
      <div className="gallery-header">
        <div>
          <h2 className="font-cinzel gallery-title">Karakterlerim</h2>
          <p className="gallery-subtitle">
            {state.characters.length > 0
              ? `${state.characters.length} kayıtlı karakter — seçmek için tıkla`
              : 'Henüz karakter yok — ilk kahramanını yarat!'}
          </p>
        </div>

        {activeCharacter && (
          <button
            id="btn-open-active-sheet"
            className="action-button gallery-open-btn"
            onClick={onOpenSheet}
          >
            📜 {activeCharacter.name} Kağıdını Aç →
          </button>
        )}
      </div>

      {/* Bildirimler */}
      {importError && (
        <div className="gallery-alert error" role="alert">
          ❌ {importError}
        </div>
      )}
      {importSuccess && (
        <div className="gallery-alert success" role="status">
          ✅ {importSuccess}
        </div>
      )}

      {/* Kart Izgarası */}
      <div className="char-gallery-grid">
        {state.characters.map((char) => (
          <CharacterCard
            key={char.id}
            character={char}
            isActive={activeCharacter?.id === char.id}
            onSelect={() => handleSelect(char)}
            onDelete={() => deleteCharacter(char.id)}
            onExport={() => exportCharacter(char.id)}
          />
        ))}

        {/* Yeni Karakter / İçe Aktar */}
        <NewCharCard onNew={onCreateNew} onImport={handleImport} />
      </div>
    </div>
  );
};
