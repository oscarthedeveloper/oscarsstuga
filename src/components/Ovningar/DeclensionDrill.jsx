import React, {useState, useCallback, useMemo} from 'react';
import styles from './ovningar.module.css';

// Explicita former per substantiv (garanterat korrekta).
// akkSg/datSg/genSg = singularformer; plural = nom/akk/gen plural; datPl = dativ plural.
const NOUNS = [
  // ── Regelbundna: maskulinum ──
  {word: 'Hund',   g: 'm', sv: 'hund',   cat: 'Regelbundna', akkSg: 'Hund',   datSg: 'Hund',   genSg: 'Hundes',   plural: 'Hunde',   datPl: 'Hunden'},
  {word: 'Tisch',  g: 'm', sv: 'bord',   cat: 'Regelbundna', akkSg: 'Tisch',  datSg: 'Tisch',  genSg: 'Tisches',  plural: 'Tische',  datPl: 'Tischen'},
  {word: 'Mann',   g: 'm', sv: 'man',    cat: 'Regelbundna', akkSg: 'Mann',   datSg: 'Mann',   genSg: 'Mannes',   plural: 'Männer',  datPl: 'Männern'},
  {word: 'Freund', g: 'm', sv: 'vän',    cat: 'Regelbundna', akkSg: 'Freund', datSg: 'Freund', genSg: 'Freundes', plural: 'Freunde', datPl: 'Freunden'},
  {word: 'Tag',    g: 'm', sv: 'dag',    cat: 'Regelbundna', akkSg: 'Tag',    datSg: 'Tag',    genSg: 'Tages',    plural: 'Tage',    datPl: 'Tagen'},
  {word: 'Apfel',  g: 'm', sv: 'äpple',  cat: 'Regelbundna', akkSg: 'Apfel',  datSg: 'Apfel',  genSg: 'Apfels',   plural: 'Äpfel',   datPl: 'Äpfeln'},

  // ── Regelbundna: femininum (ingen singularändelse) ──
  {word: 'Frau',   g: 'f', sv: 'kvinna', cat: 'Regelbundna', akkSg: 'Frau',   datSg: 'Frau',   genSg: 'Frau',   plural: 'Frauen',  datPl: 'Frauen'},
  {word: 'Katze',  g: 'f', sv: 'katt',   cat: 'Regelbundna', akkSg: 'Katze',  datSg: 'Katze',  genSg: 'Katze',  plural: 'Katzen',  datPl: 'Katzen'},
  {word: 'Stadt',  g: 'f', sv: 'stad',   cat: 'Regelbundna', akkSg: 'Stadt',  datSg: 'Stadt',  genSg: 'Stadt',  plural: 'Städte',  datPl: 'Städten'},
  {word: 'Blume',  g: 'f', sv: 'blomma', cat: 'Regelbundna', akkSg: 'Blume',  datSg: 'Blume',  genSg: 'Blume',  plural: 'Blumen',  datPl: 'Blumen'},
  {word: 'Schule', g: 'f', sv: 'skola',  cat: 'Regelbundna', akkSg: 'Schule', datSg: 'Schule', genSg: 'Schule', plural: 'Schulen', datPl: 'Schulen'},
  {word: 'Hand',   g: 'f', sv: 'hand',   cat: 'Regelbundna', akkSg: 'Hand',   datSg: 'Hand',   genSg: 'Hand',   plural: 'Hände',   datPl: 'Händen'},

  // ── Regelbundna: neutrum ──
  {word: 'Kind',   g: 'n', sv: 'barn',   cat: 'Regelbundna', akkSg: 'Kind',   datSg: 'Kind',   genSg: 'Kindes',   plural: 'Kinder',  datPl: 'Kindern'},
  {word: 'Haus',   g: 'n', sv: 'hus',    cat: 'Regelbundna', akkSg: 'Haus',   datSg: 'Haus',   genSg: 'Hauses',   plural: 'Häuser',  datPl: 'Häusern'},
  {word: 'Buch',   g: 'n', sv: 'bok',    cat: 'Regelbundna', akkSg: 'Buch',   datSg: 'Buch',   genSg: 'Buches',   plural: 'Bücher',  datPl: 'Büchern'},
  {word: 'Auto',   g: 'n', sv: 'bil',    cat: 'Regelbundna', akkSg: 'Auto',   datSg: 'Auto',   genSg: 'Autos',    plural: 'Autos',   datPl: 'Autos'},
  {word: 'Jahr',   g: 'n', sv: 'år',     cat: 'Regelbundna', akkSg: 'Jahr',   datSg: 'Jahr',   genSg: 'Jahres',   plural: 'Jahre',   datPl: 'Jahren'},
  {word: 'Bild',   g: 'n', sv: 'bild',   cat: 'Regelbundna', akkSg: 'Bild',   datSg: 'Bild',   genSg: 'Bildes',   plural: 'Bilder',  datPl: 'Bildern'},

  // ── Oregelbundna: svaga substantiv (n-deklination) ──
  {word: 'Junge',   g: 'm', sv: 'pojke',   cat: 'Oregelbundna', akkSg: 'Jungen',    datSg: 'Jungen',    genSg: 'Jungen',    plural: 'Jungen',    datPl: 'Jungen'},
  {word: 'Student', g: 'm', sv: 'student', cat: 'Oregelbundna', akkSg: 'Studenten', datSg: 'Studenten', genSg: 'Studenten', plural: 'Studenten', datPl: 'Studenten'},
  {word: 'Mensch',  g: 'm', sv: 'människa',cat: 'Oregelbundna', akkSg: 'Menschen',  datSg: 'Menschen',  genSg: 'Menschen',  plural: 'Menschen',  datPl: 'Menschen'},
  {word: 'Herr',    g: 'm', sv: 'herre',   cat: 'Oregelbundna', akkSg: 'Herrn',     datSg: 'Herrn',     genSg: 'Herrn',     plural: 'Herren',    datPl: 'Herren'},
  {word: 'Nachbar', g: 'm', sv: 'granne',  cat: 'Oregelbundna', akkSg: 'Nachbarn',  datSg: 'Nachbarn',  genSg: 'Nachbarn',  plural: 'Nachbarn',  datPl: 'Nachbarn'},
  {word: 'Name',    g: 'm', sv: 'namn',    cat: 'Oregelbundna', akkSg: 'Namen',     datSg: 'Namen',     genSg: 'Namens',    plural: 'Namen',     datPl: 'Namen'},
];

const CASES = ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'];
const CATS = ['Alla', 'Regelbundna', 'Oregelbundna'];
const GENDER_LABEL = {m: 'maskulinum', f: 'femininum', n: 'neutrum'};

const ARTICLE = {
  Nominativ: {m: 'der', f: 'die', n: 'das', pl: 'die'},
  Akkusativ: {m: 'den', f: 'die', n: 'das', pl: 'die'},
  Dativ:     {m: 'dem', f: 'der', n: 'dem', pl: 'den'},
  Genitiv:   {m: 'des', f: 'der', n: 'des', pl: 'der'},
};

function expected(noun, kasus, plural) {
  if (plural) {
    const art = ARTICLE[kasus].pl;
    const form = kasus === 'Dativ' ? noun.datPl : noun.plural;
    return `${art} ${form}`;
  }
  const art = ARTICLE[kasus][noun.g];
  const form =
    kasus === 'Nominativ' ? noun.word :
    kasus === 'Akkusativ' ? noun.akkSg :
    kasus === 'Dativ' ? noun.datSg : noun.genSg;
  return `${art} ${form}`;
}

function cx(...p) { return p.filter(Boolean).join(' '); }
function norm(s) { return (s || '').trim().toLowerCase().replace(/ß/g, 'ss').replace(/\s+/g, ' '); }
function rand(n) { return Math.floor(Math.random() * n); }

const EMPTY = CASES.map(() => ['', '']);
const TOTAL_CELLS = CASES.length * 2;

export default function DeclensionDrill() {
  const [cat, setCat] = useState('Alla');
  const [ni, setNi] = useState(0); // index i NOUNS (deterministiskt vid SSR)
  const [answers, setAnswers] = useState(EMPTY);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState({right: 0, total: 0});

  const pool = useMemo(
    () => NOUNS.map((n, i) => i).filter((i) => cat === 'Alla' || NOUNS[i].cat === cat),
    [cat]
  );

  const noun = NOUNS[ni];

  const setCell = (r, c, val) =>
    setAnswers((a) => a.map((row, ri) => (ri === r ? row.map((x, ci) => (ci === c ? val : x)) : row)));

  const isOk = (r, c) => norm(answers[r][c]) === norm(expected(noun, CASES[r], c === 1));
  const rightCount = CASES.reduce((acc, _, r) => acc + (isOk(r, 0) ? 1 : 0) + (isOk(r, 1) ? 1 : 0), 0);

  function pickNoun(fromPool, prev) {
    if (fromPool.length === 0) return prev;
    let idx, tries = 0;
    do { idx = fromPool[rand(fromPool.length)]; tries++; } while (idx === prev && fromPool.length > 1 && tries < 12);
    return idx;
  }

  const check = useCallback(() => {
    if (checked) return;
    setChecked(true);
    setScore((s) => ({right: s.right + rightCount, total: s.total + TOTAL_CELLS}));
  }, [checked, rightCount]);

  const next = useCallback(() => {
    setNi((prev) => pickNoun(pool, prev));
    setAnswers(EMPTY);
    setChecked(false);
  }, [pool]);

  const onCat = (c) => {
    setCat(c);
    const newPool = NOUNS.map((n, i) => i).filter((i) => c === 'Alla' || NOUNS[i].cat === c);
    setNi(pickNoun(newPool, -1));
    setAnswers(EMPTY);
    setChecked(false);
  };

  const reset = useCallback(() => {
    setScore({right: 0, total: 0});
    setAnswers(EMPTY);
    setChecked(false);
    setNi(pickNoun(pool, -1));
  }, [pool]);

  function onKeyDown(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (!checked) check(); else next();
  }

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
      </div>

      <div className={styles.head}>
        <span className={styles.headMain}>{noun.word}</span>
        <span className={styles.pill}>{GENDER_LABEL[noun.g]}</span>
        <span className={styles.pillAlt}>{noun.cat.toLowerCase()}</span>
        <div className={styles.headSub}>{noun.sv} — bestämd artikel</div>
      </div>

      <div className={styles.gridWrap}>
        <div className={styles.grid3}>
          <div className={styles.colHead} />
          <div className={styles.colHead}>Singular</div>
          <div className={styles.colHead}>Plural</div>

          {CASES.map((kasus, r) => (
            <React.Fragment key={kasus}>
              <div className={styles.rowLabel}>{kasus}</div>
              {[0, 1].map((c) => {
                const ok = isOk(r, c);
                return (
                  <div className={styles.cell} key={c}>
                    <input
                      className={cx(styles.cellInput, checked && (ok ? styles.inputCorrect : styles.inputWrong))}
                      value={answers[r][c]}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="…"
                      autoComplete="off"
                      spellCheck={false}
                      disabled={checked}
                    />
                    {checked && !ok && <span className={styles.reveal}>{expected(noun, kasus, c === 1)}</span>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        {!checked ? (
          <button className={styles.btn} onClick={check}>Kontrollera</button>
        ) : (
          <button className={styles.btn} onClick={next}>Nästa substantiv →</button>
        )}
        {checked && <span className={styles.summary}>{rightCount} / {TOTAL_CELLS} rätt</span>}
      </div>
    </div>
  );
}
