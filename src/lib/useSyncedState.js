// useSyncedState — localStorage-first med tillförlitlig, användarspecifik Supabase-synk.
//
// Varje collection lagras lokalt för snabb/offline användning och i user_data för
// den inloggade användaren. Om molnet saknar en collection importeras den lokala
// kopian vid första synkroniseringen.

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
  const initialRef = useRef(initial);
  const supaRef = useRef(null);
  const userRef = useRef(null);
  const syncReadyRef = useRef(false);
  const pendingRef = useRef(undefined);
  const writeChainRef = useRef(Promise.resolve());

  const enqueueWrite = useCallback(
    (val) => {
      const supa = supaRef.current;
      const user = userRef.current;
      if (!supa || !user) {
        pendingRef.current = val;
        return;
      }

      // Skrivningar serialiseras så att en äldre förfrågan aldrig hinner
      // skriva över en nyare användarändring.
      writeChainRef.current = writeChainRef.current
        .catch(() => undefined)
        .then(async () => {
          const { error } = await supa
            .from('user_data')
            .upsert(
              { user_id: user.id, collection, data: val },
              { onConflict: 'user_id,collection' }
            );
          if (error) {
            setCloud(false);
            // eslint-disable-next-line no-console
            console.warn(`[synk] Kunde inte spara ${collection}:`, error.message);
            return;
          }
          setCloud(true);
        });
    },
    [collection]
  );

  useEffect(() => {
    let cancelled = false;
    syncReadyRef.current = false;

    let localValue = initialRef.current;
    let hasLocalValue = false;

    // 1. localStorage — direkt
    try {
      const raw = localStorage.getItem(PREFIX + collection);
      if (raw != null) {
        localValue = JSON.parse(raw);
        hasLocalValue = true;
      }
    } catch {
      /* ignorera trasig localStorage */
    }
    setValue(localValue);
    setReady(true);

    // 2. Supabase — hämta den inloggade användarens kopia. Om den saknas
    // importeras lokal data i stället för att tyst gå förlorad vid deploy.
    getSupabase(supabaseUrl, supabaseAnonKey).then(async (supa) => {
      if (!supa || cancelled) return;
      try {
        const { data: authData, error: authError } = await supa.auth.getUser();
        const user = authData?.user;
        if (authError || !user) {
          // eslint-disable-next-line no-console
          console.warn('[synk] Ingen inloggad användare för molnsynk.');
          return;
        }

        supaRef.current = supa;
        userRef.current = user;
        const { data, error } = await supa
          .from('user_data')
          .select('data')
          .eq('collection', collection)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          // eslint-disable-next-line no-console
          console.warn(`[synk] Kunde inte hämta ${collection}:`, error.message);
          return;
        }

        syncReadyRef.current = true;
        setCloud(true);

        // En ändring som gjorts medan läsningen pågick ska alltid vinna över
        // den äldre molnkopian.
        if (pendingRef.current !== undefined) {
          const pending = pendingRef.current;
          pendingRef.current = undefined;
          enqueueWrite(pending);
        } else if (data && data.data != null) {
          setValue(data.data);
          try {
            localStorage.setItem(PREFIX + collection, JSON.stringify(data.data));
          } catch {
            /* ignore */
          }
        } else if (hasLocalValue) {
          enqueueWrite(localValue);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`[synk] Kunde inte hämta ${collection}:`, err?.message);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, enqueueWrite, supabaseAnonKey, supabaseUrl]);

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const val = typeof next === 'function' ? next(prev) : next;
        try {
          localStorage.setItem(PREFIX + collection, JSON.stringify(val));
        } catch {
          /* ignore */
        }
        if (syncReadyRef.current) {
          enqueueWrite(val);
        } else {
          // Behåll den senaste ändringen tills användaren och molnkopian har
          // verifierats. Den tappas då inte vid en snabb första interaktion.
          pendingRef.current = val;
        }
        return val;
      });
    },
    [enqueueWrite]
  );

  return { value, update, ready, cloud };
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
