import React, { useState } from 'react';
import styles from './auth.module.css';

// Användarnamn → e-post för Supabase Auth. Innehåller texten '@' används den
// som den är; annars läggs en fast domän till så man kan logga in med enbart namn.
function toEmail(u) {
  const v = (u || '').trim().toLowerCase();
  if (!v) return '';
  return v.includes('@') ? v : `${v}@oscarsstuga.local`;
}

function Mountains() {
  return (
    <svg className={styles.mountains} viewBox="0 0 1440 620" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="authfog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className={styles.fogStop} stopOpacity="0" />
          <stop offset="72%" className={styles.fogStop} stopOpacity="0.55" />
          <stop offset="100%" className={styles.fogStop} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path className={styles.ridgeBack} d="M0 372 L180 300 L360 348 L560 286 L760 340 L980 296 L1200 346 L1440 312 L1440 620 L0 620 Z" />
      <path className={styles.ridgeMid} d="M0 442 L240 384 L470 428 L700 362 L940 420 L1180 372 L1440 410 L1440 620 L0 620 Z" />
      <path className={styles.ridgeFront} d="M0 512 L300 462 L600 512 L880 456 L1160 510 L1440 470 L1440 620 L0 620 Z" />
      <rect x="0" y="180" width="1440" height="440" fill="url(#authfog)" />
    </svg>
  );
}

export default function LoginGate({ supa, status }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!supa) { setError('Kunde inte ansluta till servern. Försök igen senare.'); return; }
    if (!username.trim() || !password) { setError('Fyll i användarnamn och lösenord.'); return; }
    setBusy(true);
    const res = await supa.auth.signInWithPassword({ email: toEmail(username), password });
    setBusy(false);
    if (res.error) setError('Fel användarnamn eller lösenord.');
    // Vid lyckad inloggning uppdaterar onAuthStateChange status i Root.
  }

  return (
    <div className={styles.gate}>
      <Mountains />
      <div className={styles.gateInner}>
        <p className={styles.kicker}>Oscars Stuga</p>
        <h1 className={styles.title}>Logga in.</h1>
        <p className={styles.sub}>Den här sidan är privat.</p>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.field}>
            <span className={styles.label}>Användarnamn</span>
            <input
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Lösenord</span>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {(error || status === 'error') && (
            <div className={styles.error}>{error || 'Kunde inte ansluta till servern.'}</div>
          )}

          <button className={styles.btn} type="submit" disabled={busy}>
            {busy ? 'Loggar in …' : 'Logga in'}
            <span className={styles.btnArrow} aria-hidden="true">&rarr;</span>
          </button>
        </form>
      </div>
    </div>
  );
}
