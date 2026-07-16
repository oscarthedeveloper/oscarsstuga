// useSyncedState — generisk localStorage-first + Supabase-synk för en "collection".
//
// Lagrar ett godtyckligt JSON-värde (t.ex. en array med kort) under en nyckel.
// Läser localStorage direkt; hämtar från Supabase (tabellen hp_data) vid mount
// och skriver tillbaka fire-and-forget vid varje uppdatering. Utan Supabase-nycklar
// körs allt lokalt.

import { useState, useEffect, useRef, useCallback } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getSupabase } from '@site/src/lib/supabaseClient';

const PREFIX = 'oscarsstuga:';

export function useSyncedState(collection, initial) {
  const { siteConfig } = useDocusaurusContext();
  const { supabaseUrl, supabaseAnonKey } = siteConfig.customFields || {};

  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);
  const [cloud, setCloud] = useState(false);
  const supaRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    // 1. localStorage — direkt
    try {
      const raw = localStorage.getItem(PREFIX + collection);
      if (raw != null) setValue(JSON.parse(raw));
    } catch {
      /* ignorera trasig localStorage */
    }
    setReady(true);

    // 2. Supabase — hämta och skriv över om det finns data
    getSupabase(supabaseUrl, supabaseAnonKey).then(async (supa) => {
      if (!supa || cancelled) return;
      supaRef.current = supa;
      setCloud(true);
      try {
        const { data, error } = await supa
          .from('hp_data')
          .select('data')
          .eq('collection', collection)
          .maybeSingle();
        if (!error && data && data.data != null && !cancelled) {
          setValue(data.data);
          try {
            localStorage.setItem(PREFIX + collection, JSON.stringify(data.data));
          } catch {
            /* ignore */
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`[ordabok] Kunde inte hämta ${collection}:`, err?.message);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const val = typeof next === 'function' ? next(prev) : next;
        try {
          localStorage.setItem(PREFIX + collection, JSON.stringify(val));
        } catch {
          /* ignore */
        }
        const supa = supaRef.current;
        if (supa) {
          supa
            .from('hp_data')
            .upsert({ collection, data: val }, { onConflict: 'collection' })
            .then(({ error }) => {
              if (error) {
                // eslint-disable-next-line no-console
                console.warn(`[ordabok] Synk misslyckades (${collection}):`, error.message);
              }
            });
        }
        return val;
      });
    },
    [collection]
  );

  return { value, update, ready, cloud };
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
