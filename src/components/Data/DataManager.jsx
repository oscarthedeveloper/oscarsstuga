import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getSupabase } from '@site/src/lib/supabaseClient';
import styles from './data.module.css';

const PREFIX = 'oscarsstuga:';

export default function DataManager() {
  const { siteConfig } = useDocusaurusContext();
  const { supabaseUrl, supabaseAnonKey } = siteConfig.customFields || {};
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function collectFromCloud() {
    const supa = await getSupabase(supabaseUrl, supabaseAnonKey);
    if (!supa) return null;
    const { data: auth } = await supa.auth.getUser();
    if (!auth || !auth.user) return null;
    const { data, error } = await supa.from('user_data').select('collection, data');
    if (error) return null;
    const out = {};
    (data || []).forEach((r) => { out[r.collection] = r.data; });
    return out;
  }
  function collectFromLocal() {
    const out = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX)) {
          try { out[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k)); } catch { /* hoppa över */ }
        }
      }
    } catch { /* ignore */ }
    return out;
  }

  async function exportData() {
    setBusy(true);
    setStatus('Samlar in data …');
    let collections = await collectFromCloud();
    let source = 'molnet';
    if (!collections || Object.keys(collections).length === 0) {
      collections = collectFromLocal();
      source = 'den här enheten';
    }
    const payload = { app: 'Oscars Stuga', version: 1, exportedAt: new Date().toISOString(), collections };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oscars-stuga-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setBusy(false);
    setStatus(`Exporterade ${Object.keys(collections).length} samlingar (från ${source}).`);
  }

  async function importData(file) {
    setBusy(true);
    setStatus('Läser fil …');
    let payload;
    try { payload = JSON.parse(await file.text()); }
    catch { setBusy(false); setStatus('Kunde inte läsa filen — ogiltig JSON.'); return; }
    const collections = payload && payload.collections ? payload.collections : payload;
    if (!collections || typeof collections !== 'object') {
      setBusy(false);
      setStatus('Filen innehåller ingen data.');
      return;
    }
    const entries = Object.entries(collections);
    for (const [c, d] of entries) {
      try { localStorage.setItem(PREFIX + c, JSON.stringify(d)); } catch { /* ignore */ }
    }
    let cloudMsg = '';
    const supa = await getSupabase(supabaseUrl, supabaseAnonKey);
    if (supa) {
      const { data: auth } = await supa.auth.getUser();
      if (auth && auth.user) {
        const rows = entries.map(([c, d]) => ({ user_id: auth.user.id, collection: c, data: d }));
        const { error } = await supa.from('user_data').upsert(rows, { onConflict: 'user_id,collection' });
        cloudMsg = error ? ' (molnsynk misslyckades)' : ' och synkade till molnet';
      }
    }
    setBusy(false);
    setStatus(`Importerade ${entries.length} samlingar${cloudMsg}. Laddar om …`);
    setTimeout(() => { if (typeof window !== 'undefined') window.location.reload(); }, 1400);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.h}>Exportera</div>
        <p className={styles.p}>
          Ladda ner all din data (glosor, ordabok, projekt, HP-resultat, anteckningar m.m.)
          som en JSON-fil att spara som säkerhetskopia.
        </p>
        <button className={styles.btn} onClick={exportData} disabled={busy}>Exportera till JSON</button>
      </div>

      <div className={styles.card}>
        <div className={styles.h}>Importera</div>
        <p className={styles.p}>
          Läs in en tidigare exporterad JSON-fil. Samlingar med samma namn skrivs över —
          sidan laddas om efteråt.
        </p>
        <label className={`${styles.btnGhost} ${busy ? styles.disabled : ''}`}>
          Välj JSON-fil …
          <input
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            disabled={busy}
            onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) importData(f); e.target.value = ''; }}
          />
        </label>
      </div>

      {status && <div className={styles.status}>{status}</div>}
    </div>
  );
}
