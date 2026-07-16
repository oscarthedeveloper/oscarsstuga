import React, { useState, useMemo } from 'react';
import { VERBS, TENSES, CATS, FINITE_PERSONS, IMPERATIVE_PERSONS, getForms } from './verbs';
import styles from '@site/src/components/Ovningar/ovningar.module.css';

function cx(...p) { return p.filter(Boolean).join(' '); }
// Behåll accenter (betydelsebärande), men strippa apostrofer och gemener/trim.
function norm(s) {
  return (s || '').trim().toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ');
}
function rand(n) { return Math.floor(Math.random() * n); }
function randomTenseKey() { return TENSES[rand(TENSES.length)].key; }
function tenseByKey(k) { return TENSES.find((t) => t.key === k) || TENSES[0]; }

// Tempus grupperade efter modus för <optgroup>
const MOODS = ['Indikativ', 'Konjunktiv', 'Konditionalis', 'Imperativ'];

const EMPTY6 = ['', '', '', '', '', ''];

export default function ItalianVerbDrill() {
  const [cat, setCat] = useState('Alla');
  const [tenseSel, setTenseSel] = useState('Slumpmässig');
  const [vi, setVi] = useState(0);
  const [tenseKey, setTenseKey] = useState('ind_pres');
  const [answers, setAnswers] = useState(EMPTY6);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const pool = useMemo(
    () => VERBS.map((v, i) => i).filter((i) => cat === 'Alla' || VERBS[i].cat === cat),
    [cat]
  );

  const verb = VERBS[vi];
  const tense = tenseByKey(tenseKey);
  const forms = getForms(verb, tenseKey);
  const persons = tense.imperative ? IMPERATIVE_PERSONS : FINITE_PERSONS;

  const setCell = (i, val) => setAnswers((a) => a.map((x, j) => (j === i ? val : x)));
  const rightCount = (forms || []).reduce((acc, f, i) => acc + (norm(answers[i]) === norm(f) ? 1 : 0), 0);

  function pickVerb(fromPool, prev) {
    if (fromPool.length === 0) return prev;
    let idx, tries = 0;
    do { idx = fromPool[rand(fromPool.length)]; tries++; } while (idx === prev && fromPool.length > 1 && tries < 12);
    return idx;
  }

  function check() {
    if (checked || !forms) return;
    setChecked(true);
    setScore((s) => ({ right: s.right + rightCount, total: s.total + forms.length }));
  }
  function next() {
    setVi((prev) => pickVerb(pool, prev));
    setTenseKey(tenseSel === 'Slumpmässig' ? randomTenseKey() : tenseSel);
    setAnswers(EMPTY6);
    setChecked(false);
  }
  function onCat(c) {
    setCat(c);
    const newPool = VERBS.map((v, i) => i).filter((i) => c === 'Alla' || VERBS[i].cat === c);
    setVi(pickVerb(newPool, -1));
    setTenseKey(tenseSel === 'Slumpmässig' ? randomTenseKey() : tenseSel);
    setAnswers(EMPTY6);
    setChecked(false);
  }
  function onTense(val) {
    setTenseSel(val);
    setTenseKey(val === 'Slumpmässig' ? randomTenseKey() : val);
    setAnswers(EMPTY6);
    setChecked(false);
  }
  function reset() {
    setScore({ right: 0, total: 0 });
    setAnswers(EMPTY6);
    setChecked(false);
    setVi(pickVerb(pool, -1));
    setTenseKey(tenseSel === 'Slumpmässig' ? randomTenseKey() : tenseSel);
  }
  function onKeyDown(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (!checked) check(); else next();
  }

  const pillLabel = tense.mood === 'Imperativ' ? 'Imperativ' : `${tense.mood} · ${tense.label}`;

  return (
    <div className={styles.drill}>
      <div className={styles.topRow}>
        <span className={styles.score}>Rätt: {score.right} / {score.total} rutor</span>
        <button className={styles.reset} onClick={reset}>Nollställ</button>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Kategori</span>
          {CATS.map((c) => (
            <button key={c} className={cx(styles.chip, cat === c && styles.chipActive)} onClick={() => onCat(c)}>{c}</button>
          ))}
        </div>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Tempus</span>
          <select
            className={styles.cellInput}
            style={{ width: 'auto', maxWidth: '280px' }}
            value={tenseSel}
            onChange={(e) => onTense(e.target.value)}
          >
            <option value="Slumpmässig">Slumpmässig</option>
            {MOODS.map((m) => (
              <optgroup key={m} label={m}>
                {TENSES.filter((t) => t.mood === m).map((t) => (
                  <option key={t.key} value={t.key}>{t.imperative ? 'Imperativ' : t.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.head}>
        <span className={styles.headMain}>{verb.inf}</span>
        <span className={styles.pill}>{pillLabel}</span>
        <div className={styles.headSub}>{verb.sv} · {verb.cat.toLowerCase()} · hjälpverb: {verb.aux}</div>
      </div>

      {forms ? (
        <>
          <div className={styles.grid2}>
            {persons.map((pr, i) => {
              const ok = norm(answers[i]) === norm(forms[i]);
              return (
                <React.Fragment key={pr + i}>
                  <div className={styles.rowLabel}>{pr}</div>
                  <div className={styles.cell}>
                    <input
                      className={cx(styles.cellInput, checked && (ok ? styles.inputCorrect : styles.inputWrong))}
                      value={answers[i]}
                      onChange={(e) => setCell(i, e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="…"
                      autoComplete="off"
                      spellCheck={false}
                      disabled={checked}
                    />
                    {checked && !ok && <span className={styles.reveal}>{forms[i]}</span>}
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          <div className={styles.actions}>
            {!checked ? (
              <button className={styles.btn} onClick={check}>Kontrollera</button>
            ) : (
              <button className={styles.btn} onClick={next}>Nästa verb →</button>
            )}
            {checked && <span className={styles.summary}>{rightCount} / {forms.length} rätt</span>}
          </div>
        </>
      ) : (
        <div className={styles.actions} style={{ marginTop: '1rem' }}>
          <span className={styles.summary}>Verbet <b>{verb.inf}</b> har ingen imperativ.</span>
          <button className={styles.btn} onClick={next}>Nästa verb →</button>
        </div>
      )}
    </div>
  );
}
