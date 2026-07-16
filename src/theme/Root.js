import React, { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getSupabase } from '@site/src/lib/supabaseClient';
import LoginGate from '@site/src/components/Auth/LoginGate';
import styles from '@site/src/components/Auth/auth.module.css';

// Omsluter hela sidan. Visar inloggning tills en Supabase-session finns.
export default function Root({ children }) {
  const { siteConfig } = useDocusaurusContext();
  const cf = siteConfig.customFields || {};
  const [status, setStatus] = useState('loading'); // loading | authed | anon | error
  const [supa, setSupa] = useState(null);

  useEffect(() => {
    let active = true;
    let sub;
    getSupabase(cf.supabaseUrl, cf.supabaseAnonKey).then((client) => {
      if (!active) return;
      if (!client) { setStatus('error'); return; }
      setSupa(client);
      client.auth.getSession().then(({ data }) => {
        if (active) setStatus(data && data.session ? 'authed' : 'anon');
      });
      const res = client.auth.onAuthStateChange((_event, session) => {
        setStatus(session ? 'authed' : 'anon');
      });
      sub = res && res.data ? res.data.subscription : null;
    });
    return () => { active = false; if (sub) sub.unsubscribe(); };
  }, [cf.supabaseUrl, cf.supabaseAnonKey]);

  if (status === 'authed') {
    return (
      <>
        {children}
        <button
          className={styles.logout}
          title="Logga ut"
          onClick={() => supa && supa.auth.signOut()}
        >
          Logga ut
        </button>
      </>
    );
  }

  if (status === 'loading') {
    return (
      <div className={styles.splash}>
        <span className={styles.splashMark}>Oscars Stuga</span>
      </div>
    );
  }

  return <LoginGate supa={supa} status={status} />;
}
