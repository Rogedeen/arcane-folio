import React from 'react';

export const NotesTabContent: React.FC = () => {
  return (
    <div className="dndbeyond-card" id="tab-content-notes-view">
      <div className="dndbeyond-card-header">CAMPAIGN & ADVENTURE NOTES</div>
      <textarea
        placeholder="Önemli NPC'ler, harita konumları, görevler ve ganimet notları..."
        rows={8}
        style={{
          width: '100%',
          background: 'rgba(10, 13, 22, 0.8)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          color: '#fff',
          padding: '0.6rem',
          fontSize: '0.85rem',
        }}
      />
    </div>
  );
};
