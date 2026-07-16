import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { forceDownloadAll, forceUploadAll } from '@site/src/lib/forceSupabaseSync';
import styles from './syncControls.module.css';

export default function SyncControls() {
  const { siteConfig } = useDocusaurusContext();
  const { supabaseUrl, supabaseAnonKey } = siteConfig.customFields || {};
  const [action, setAction] = useState(null);
  const [message, setMessage] = useState('');

  const run = async (kind) => {
    if (action) return;
    setAction(kind);
    setMessage('');
    try {
      if (kind === 'upload') {
        const count = await forceUploadAll(supabaseUrl, supabaseAnonKey);
        setMessage(`${count} poster uppladdade.`);
      } else {
        const count = await forceDownloadAll(supabaseUrl, supabaseAnonKey);
        setMessage(`${count} poster hämtade. Laddar om …`);
        window.setTimeout(() => window.location.reload(), 650);
      }
    } catch (error) {
      setMessage(error?.message || 'Synken misslyckades.');
    } finally {
      setAction(null);
    }
  };

  return (
    <div className={styles.controls} aria-label="Manuell Supabase-synk">
      <button
        className={styles.button}
        type="button"
        title="Skicka all lokal sparad data till Supabase"
        disabled={Boolean(action)}
        onClick={() => run('upload')}
      >
        {action === 'upload' ? 'Laddar upp …' : '↑ Ladda upp'}
      </button>
      <button
        className={styles.button}
        type="button"
        title="Hämta all din data från Supabase"
        disabled={Boolean(action)}
        onClick={() => run('download')}
      >
        {action === 'download' ? 'Hämtar …' : '↓ Hämta'}
      </button>
      <span className={styles.status} role="status" aria-live="polite">{message}</span>
    </div>
  );
}
