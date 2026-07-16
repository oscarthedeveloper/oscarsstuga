import React, { useState } from 'react';

// Egen implementation av @theme/PwaReloadPopup (visas när en ny version av
// appen finns cachad av service workern). Matchar sidans uttryck och ligger
// nere till vänster så den inte krockar med utloggningsknappen.
export default function PwaReloadPopup({ onReload }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const wrap = {
    position: 'fixed',
    left: 'calc(1rem + env(safe-area-inset-left))',
    bottom: 'calc(1rem + env(safe-area-inset-bottom))',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    maxWidth: 'min(92vw, 22rem)',
    padding: '0.6rem 0.8rem',
    borderRadius: '12px',
    background: 'var(--ifm-background-surface-color, var(--ifm-background-color))',
    color: 'var(--ifm-font-color-base)',
    border: '1px solid var(--ifm-color-emphasis-300)',
    boxShadow: '0 10px 30px rgba(30, 29, 26, 0.18)',
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontSize: '0.85rem',
  };
  const refreshBtn = {
    appearance: 'none',
    border: 'none',
    borderRadius: '8px',
    background: 'var(--ifm-color-primary)',
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 600,
    padding: '0.4rem 0.8rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
  const closeBtn = {
    appearance: 'none',
    border: 'none',
    background: 'none',
    color: 'var(--ifm-color-emphasis-600)',
    fontSize: '1.1rem',
    lineHeight: 1,
    cursor: 'pointer',
    padding: '0.1rem 0.3rem',
  };

  return (
    <div style={wrap} role="status">
      <span style={{ flex: 1 }}>Ny version tillgänglig</span>
      <button
        type="button"
        style={refreshBtn}
        onClick={() => { setVisible(false); onReload(); }}
      >
        Uppdatera
      </button>
      <button type="button" aria-label="Stäng" style={closeBtn} onClick={() => setVisible(false)}>
        ×
      </button>
    </div>
  );
}
