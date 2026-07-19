import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { forceDownloadAll } from '@site/src/lib/forceSupabaseSync';
import styles from './syncControls.module.css';

export default function SyncControls() {
  const { siteConfig } = useDocusaurusContext();
  const { supabaseUrl, supabaseAnonKey } = siteConfig.customFields || {};
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const run = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const count = await forceDownloadAll(supabaseUrl, supabaseAnonKey);
      setMessage(`${count} poster hämtade. Laddar om …`);
      window.setTimeout(() => window.location.reload(), 650);
    } catch (error) {
      setMessage(error?.message || 'Hämtningen misslyckades.');
      setBusy(false);
    }
  };

  return (
    <div className={styles.controls} aria-label="Hämta data från Supabase">
      <button
        className={styles.button}
        type="button"
        title="Hämta all din data från Supabase"
        disabled={busy}
        onClick={run}
      >
        {busy ? 'Hämtar …' : '↓ Hämta'}
      </button>
      <span className={styles.status} role="status" aria-live="polite">{message}</span>
    </div>
  );
}
