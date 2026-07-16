// useHPData — datalager för HP-trackern.
//
// Tier 1: localStorage (snabb, synkron, offline)
// Tier 2: Supabase (moln-backup, synkad asynkront)
//
// Tre "collections" lagras: sessions[], exams[], meta{examDate}.
// Läsningar sker från localStorage; skrivningar går till localStorage
// direkt och till Supabase fire-and-forget.

import { useState, useEffect, useCallback, useRef } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getSupabase } from '@site/src/lib/supabaseClient';

const PREFIX = 'oscarsstuga:hp:';

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function lsRead(collection, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + collection);
    return raw == null
      ? { value: fallback, exists: false }
      : { value: JSON.parse(raw), exists: true };
  } catch {
    return { value: fallback, exists: false };
  }
}

function lsSet(collection, data) {
  try {
    localStorage.setItem(PREFIX + collection, JSON.stringify(data));
  } catch {
    /* full/otillgänglig localStorage — ignorera */
  }
}

export function useHPData() {
  const { siteConfig } = useDocusaurusContext();
  const { supabaseUrl, supabaseAnonKey } = siteConfig.customFields || {};

  const [sessions, setSessions] = useState([]);
  const [hpExams, setHpExams] = useState([]);
  const [examDate, setExamDateState] = useState(null);
  const [ready, setReady] = useState(false);
  const [cloud, setCloud] = useState(false); // true om Supabase är påkopplat

  const supaRef = useRef(null);
  const userRef = useRef(null);
  const syncReadyRef = useRef(false);
  const pendingRef = useRef(new Map());
  const writeChainsRef = useRef(new Map());

  const enqueueWrite = useCallback((collection, data) => {
    const supa = supaRef.current;
    const user = userRef.current;
    if (!supa || !user) {
      pendingRef.current.set(collection, data);
      return;
    }

    const previous = writeChainsRef.current.get(collection) || Promise.resolve();
    const next = previous
      .catch(() => undefined)
      .then(async () => {
        const { error } = await supa
          .from('user_data')
          .upsert(
            { user_id: user.id, collection, data },
            { onConflict: 'user_id,collection' }
          );
        if (error) {
          setCloud(false);
          // eslint-disable-next-line no-console
          console.warn(`[hp] Synk misslyckades (${collection}):`, error.message);
          return;
        }
        setCloud(true);
      });
    writeChainsRef.current.set(collection, next);
  }, []);

  // ── Ladda: localStorage först, sedan (om möjligt) Supabase ────────────────
  useEffect(() => {
    let cancelled = false;
    syncReadyRef.current = false;

    // 1. localStorage — direkt
    const localSessions = lsRead('sessions', []);
    const localExams = lsRead('exams', []);
    const localMeta = lsRead('meta', {});
    setSessions(localSessions.value);
    setHpExams(localExams.value);
    setExamDateState(localMeta.value.examDate ?? null);
    setReady(true);

    // 2. Supabase — hämta och skriv över om det finns data
    getSupabase(supabaseUrl, supabaseAnonKey).then(async (supa) => {
      if (!supa || cancelled) return;
      try {
        const { data: authData, error: authError } = await supa.auth.getUser();
        const user = authData?.user;
        if (authError || !user) return;

        supaRef.current = supa;
        userRef.current = user;
        const { data, error } = await supa
          .from('user_data')
          .select('collection, data')
          .eq('user_id', user.id);
        if (cancelled || error) return;
        const byCol = Object.fromEntries(data.map((r) => [r.collection, r.data]));
        syncReadyRef.current = true;
        setCloud(true);

        const pending = new Map(pendingRef.current);
        pendingRef.current.clear();
        const collections = [
          ['sessions', localSessions, Array.isArray],
          ['exams', localExams, Array.isArray],
          ['meta', localMeta, (value) => value && typeof value === 'object' && !Array.isArray(value)],
        ];
        collections.forEach(([collection, local, valid]) => {
          if (pending.has(collection)) {
            enqueueWrite(collection, pending.get(collection));
          } else if (valid(byCol[collection])) {
            const remote = byCol[collection];
            if (collection === 'sessions') setSessions(remote);
            if (collection === 'exams') setHpExams(remote);
            if (collection === 'meta') setExamDateState(remote.examDate ?? null);
            lsSet(collection, remote);
          } else if (local.exists) {
            enqueueWrite(collection, local.value);
          }
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[hp] Kunde inte hämta från Supabase:', err?.message);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enqueueWrite, supabaseAnonKey, supabaseUrl]);

  // ── Persist-hjälp: skriv en collection till localStorage + Supabase ───────
  const persist = useCallback((collection, data) => {
    lsSet(collection, data);
    if (syncReadyRef.current) {
      enqueueWrite(collection, data);
    } else {
      pendingRef.current.set(collection, data);
    }
  }, [enqueueWrite]);

  // ── Sessions ──────────────────────────────────────────────────────────────
  const addSession = useCallback(
    (session) => {
      const item = { id: genId(), createdAt: new Date().toISOString(), ...session };
      setSessions((prev) => {
        const next = [...prev, item];
        persist('sessions', next);
        return next;
      });
      if (session.year && session.season) addHpExam(Number(session.year), session.season);
      return item;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [persist]
  );

  const updateSession = useCallback(
    (id, patch) => {
      setSessions((prev) => {
        const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s));
        persist('sessions', next);
        return next;
      });
    },
    [persist]
  );

  const removeSession = useCallback(
    (id) => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        persist('sessions', next);
        return next;
      });
    },
    [persist]
  );

  // ── Provtillfällen ────────────────────────────────────────────────────────
  const addHpExam = useCallback(
    (year, season) => {
      setHpExams((prev) => {
        if (prev.some((e) => Number(e.year) === Number(year) && e.season === season)) return prev;
        const item = { id: genId(), year: Number(year), season, completed: [] };
        const next = [...prev, item];
        persist('exams', next);
        return next;
      });
    },
    [persist]
  );

  const toggleHpExamSection = useCallback(
    (examId, section) => {
      setHpExams((prev) => {
        const next = prev.map((e) => {
          if (e.id !== examId) return e;
          const completed = e.completed.includes(section)
            ? e.completed.filter((s) => s !== section)
            : [...e.completed, section];
          return { ...e, completed };
        });
        persist('exams', next);
        return next;
      });
    },
    [persist]
  );

  const removeHpExam = useCallback(
    (id) => {
      setHpExams((prev) => {
        const next = prev.filter((e) => e.id !== id);
        persist('exams', next);
        return next;
      });
    },
    [persist]
  );

  // ── Provdatum ─────────────────────────────────────────────────────────────
  const setExamDate = useCallback(
    (date) => {
      const value = date || null;
      setExamDateState(value);
      const meta = { examDate: value };
      persist('meta', meta);
    },
    [persist]
  );

  const daysUntilExam = useCallback(() => {
    if (!examDate) return null;
    const diff = Math.ceil((new Date(examDate) - new Date()) / 86400000);
    return diff > 0 ? diff : null;
  }, [examDate]);

  return {
    ready,
    cloud,
    sessions,
    hpExams,
    examDate,
    setExamDate,
    addSession,
    updateSession,
    removeSession,
    addHpExam,
    toggleHpExamSection,
    removeHpExam,
    daysUntilExam,
  };
}
