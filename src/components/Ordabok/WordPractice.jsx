import React, { useState } from 'react';
import styles from './ordabok.module.css';

function cx(...p) { return p.filter(Boolean).join(' '); }
function norm(s) { return (s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
function rand(n) { return Math.floor(Math.random() * n); }

// Byt ut ordet mot ___ i exempelmeningen (ger kontext utan att avslöja svaret)
function blankExample(example, word) {
  if (!example || !word) return example || '';
  try {
    const re = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return example.replace(re, '___');
  } catch {
    return example;
  }
}

function buildOptions(words, correctIdx) {
  const correct = words[correctIdx].word;
  const others = words.map((w, i) => i).filter((i) => i !== correctIdx);
  // blanda distraktorer
  for (let i = others.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [others[i], others[j]] = [others[j], others[i]];
  }
  const picked = others.slice(0, 3).map((i) => words[i].word);
  const opts = [correct, ...picked];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

export default function WordPractice({ words }) {
  const [mode, setMode] = useState('skriv'); // 'skriv' | 'flerval'
  const [qi, setQi] = useState(0); // deterministiskt vid SSR
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState('');
  const [picked, setPicked] = useState(null); // valt alternativ (flerval)
  const [result, setResult] = useState(null); // null | true | false
  const [score, setScore] = useState({ right: 0, total: 0 });

  if (!words || words.length === 0) {
    return <div className={styles.empty}>Lägg till ord ovan för att kunna öva.</div>;
  }

  const word = words[qi] || words[0];

  function nextQuestion(nextMode = mode) {
    let idx = qi;
    if (words.length > 1) {
      do { idx = rand(words.length); } while (idx === qi);
    }
    setQi(idx);
    setValue('');
    setPicked(null);
    setResult(null);
    if (nextMode === 'flerval') setOptions(buildOptions(words, idx));
  }

  const switchMode = (m) => {
    setMode(m);
    setValue('');
    setPicked(null);
    setResult(null);
    if (m === 'flerval') setOptions(buildOptions(words, qi));
  };

  function checkSkriv() {
    if (result !== null) return;
    const ok = norm(value) === norm(word.word);
    setResult(ok);
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
  }

  function chooseOption(opt) {
    if (result !== null) return;
    const ok = norm(opt) === norm(word.word);
    setPicked(opt);
    setResult(ok);
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
  }

  function onKeyDown(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (result === null) checkSkriv();
    else nextQuestion();
  }

  return (
    <div className={styles.practice}>
      <div className={styles.modeRow}>
        <span className={styles.modeLabel}>Övning</span>
        <button className={cx(styles.chip, mode === 'skriv' && styles.chipActive)} onClick={() => switchMode('skriv')}>Skriv ordet</button>
        <button className={cx(styles.chip, mode === 'flerval' && styles.chipActive)} onClick={() => switchMode('flerval')}>Flerval</button>
        <span className={styles.score} style={{ marginLeft: 'auto' }}>Rätt: {score.right} / {score.total}</span>
      </div>

      <div className={styles.prompt}>
        <div className={styles.promptLabel}>Vilket ord betyder…</div>
        <div className={styles.promptDef}>{word.definition || '(ingen definition)'}</div>
        {word.example && <div className={styles.promptEx}>”{blankExample(word.example, word.word)}”</div>}
      </div>

      {mode === 'skriv' ? (
        <div className={styles.answerRow}>
          <input
            className={styles.answerInput}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Skriv ordet…"
            autoComplete="off"
            spellCheck={false}
            disabled={result !== null}
          />
          {result === null ? (
            <button className={styles.btn} onClick={checkSkriv}>Kontrollera</button>
          ) : (
            <button className={styles.btn} onClick={() => nextQuestion()}>Nästa →</button>
          )}
        </div>
      ) : (
        <div className={styles.options}>
          {options.map((opt) => {
            const isCorrect = norm(opt) === norm(word.word);
            const cls = result === null ? '' : isCorrect ? styles.optionCorrect : opt === picked ? styles.optionWrong : '';
            return (
              <button key={opt} className={cx(styles.option, cls)} onClick={() => chooseOption(opt)} disabled={result !== null}>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {result !== null && (
        <>
          <div className={cx(styles.feedback, result ? styles.correct : styles.wrong)}>
            {result ? 'Rätt!' : 'Fel.'} Rätt ord: <span className={styles.answerTxt}>{word.word}</span>
          </div>
          {mode === 'flerval' && (
            <div className={styles.practiceActions}>
              <button className={styles.btn} onClick={() => nextQuestion()}>Nästa →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
