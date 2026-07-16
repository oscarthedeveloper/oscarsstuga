import React, {useState, useCallback, useMemo} from 'react';
import styles from './ovningar.module.css';

// Ordning: ich, du, er/sie/es, wir, ihr, sie/Sie
const PRONOUNS = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];

// Hjälpverb som byggstenar för sammansatta tempus
const HABEN_PRAES = ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'];
const HABEN_PRAET = ['hatte', 'hattest', 'hatte', 'hatten', 'hattet', 'hatten'];
const SEIN_PRAES = ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'];
const SEIN_PRAET = ['war', 'warst', 'war', 'waren', 'wart', 'waren'];
const WERDEN_PRAES = ['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden'];

const TENSES = ['Präsens', 'Präteritum', 'Perfekt', 'Plusquamperfekt', 'Futur I', 'Futur II'];

// aux: 'haben' | 'sein'; partizip = Partizip II
const VERBS = [
  // ── Hjälpverb ──
  {inf: 'sein',   sv: 'vara', cat: 'Hjälpverb', aux: 'sein',  part: 'gewesen',
   praes: SEIN_PRAES, praet: SEIN_PRAET},
  {inf: 'haben',  sv: 'ha',   cat: 'Hjälpverb', aux: 'haben', part: 'gehabt',
   praes: HABEN_PRAES, praet: HABEN_PRAET},
  {inf: 'werden', sv: 'bli',  cat: 'Hjälpverb', aux: 'sein',  part: 'geworden',
   praes: WERDEN_PRAES, praet: ['wurde','wurdest','wurde','wurden','wurdet','wurden']},

  // ── Modalverb ──
  {inf: 'können', sv: 'kunna', cat: 'Modalverb', aux: 'haben', part: 'gekonnt',
   praes: ['kann','kannst','kann','können','könnt','können'], praet: ['konnte','konntest','konnte','konnten','konntet','konnten']},
  {inf: 'müssen', sv: 'måste', cat: 'Modalverb', aux: 'haben', part: 'gemusst',
   praes: ['muss','musst','muss','müssen','müsst','müssen'], praet: ['musste','musstest','musste','mussten','musstet','mussten']},
  {inf: 'wollen', sv: 'vilja', cat: 'Modalverb', aux: 'haben', part: 'gewollt',
   praes: ['will','willst','will','wollen','wollt','wollen'], praet: ['wollte','wolltest','wollte','wollten','wolltet','wollten']},
  {inf: 'sollen', sv: 'böra',  cat: 'Modalverb', aux: 'haben', part: 'gesollt',
   praes: ['soll','sollst','soll','sollen','sollt','sollen'], praet: ['sollte','solltest','sollte','sollten','solltet','sollten']},
  {inf: 'dürfen', sv: 'få (lov)', cat: 'Modalverb', aux: 'haben', part: 'gedurft',
   praes: ['darf','darfst','darf','dürfen','dürft','dürfen'], praet: ['durfte','durftest','durfte','durften','durftet','durften']},
  {inf: 'mögen',  sv: 'tycka om', cat: 'Modalverb', aux: 'haben', part: 'gemocht',
   praes: ['mag','magst','mag','mögen','mögt','mögen'], praet: ['mochte','mochtest','mochte','mochten','mochtet','mochten']},

  // ── Regelbundna (svaga) ──
  {inf: 'machen',   sv: 'göra',   cat: 'Regelbundna', aux: 'haben', part: 'gemacht',
   praes: ['mache','machst','macht','machen','macht','machen'], praet: ['machte','machtest','machte','machten','machtet','machten']},
  {inf: 'spielen',  sv: 'spela',  cat: 'Regelbundna', aux: 'haben', part: 'gespielt',
   praes: ['spiele','spielst','spielt','spielen','spielt','spielen'], praet: ['spielte','spieltest','spielte','spielten','spieltet','spielten']},
  {inf: 'lernen',   sv: 'lära',   cat: 'Regelbundna', aux: 'haben', part: 'gelernt',
   praes: ['lerne','lernst','lernt','lernen','lernt','lernen'], praet: ['lernte','lerntest','lernte','lernten','lerntet','lernten']},
  {inf: 'wohnen',   sv: 'bo',     cat: 'Regelbundna', aux: 'haben', part: 'gewohnt',
   praes: ['wohne','wohnst','wohnt','wohnen','wohnt','wohnen'], praet: ['wohnte','wohntest','wohnte','wohnten','wohntet','wohnten']},
  {inf: 'arbeiten', sv: 'arbeta', cat: 'Regelbundna', aux: 'haben', part: 'gearbeitet',
   praes: ['arbeite','arbeitest','arbeitet','arbeiten','arbeitet','arbeiten'], praet: ['arbeitete','arbeitetest','arbeitete','arbeiteten','arbeitetet','arbeiteten']},
  {inf: 'kaufen',   sv: 'köpa',   cat: 'Regelbundna', aux: 'haben', part: 'gekauft',
   praes: ['kaufe','kaufst','kauft','kaufen','kauft','kaufen'], praet: ['kaufte','kauftest','kaufte','kauften','kauftet','kauften']},
  {inf: 'sagen',    sv: 'säga',   cat: 'Regelbundna', aux: 'haben', part: 'gesagt',
   praes: ['sage','sagst','sagt','sagen','sagt','sagen'], praet: ['sagte','sagtest','sagte','sagten','sagtet','sagten']},
  {inf: 'fragen',   sv: 'fråga',  cat: 'Regelbundna', aux: 'haben', part: 'gefragt',
   praes: ['frage','fragst','fragt','fragen','fragt','fragen'], praet: ['fragte','fragtest','fragte','fragten','fragtet','fragten']},
  {inf: 'lieben',   sv: 'älska',  cat: 'Regelbundna', aux: 'haben', part: 'geliebt',
   praes: ['liebe','liebst','liebt','lieben','liebt','lieben'], praet: ['liebte','liebtest','liebte','liebten','liebtet','liebten']},
  {inf: 'reisen',   sv: 'resa',   cat: 'Regelbundna', aux: 'sein', part: 'gereist',
   praes: ['reise','reist','reist','reisen','reist','reisen'], praet: ['reiste','reistest','reiste','reisten','reistet','reisten']},

  // ── Oregelbundna (starka) ──
  {inf: 'fahren',    sv: 'åka',     cat: 'Oregelbundna', aux: 'sein',  part: 'gefahren',
   praes: ['fahre','fährst','fährt','fahren','fahrt','fahren'], praet: ['fuhr','fuhrst','fuhr','fuhren','fuhrt','fuhren']},
  {inf: 'laufen',    sv: 'springa', cat: 'Oregelbundna', aux: 'sein',  part: 'gelaufen',
   praes: ['laufe','läufst','läuft','laufen','lauft','laufen'], praet: ['lief','liefst','lief','liefen','lieft','liefen']},
  {inf: 'schlafen',  sv: 'sova',    cat: 'Oregelbundna', aux: 'haben', part: 'geschlafen',
   praes: ['schlafe','schläfst','schläft','schlafen','schlaft','schlafen'], praet: ['schlief','schliefst','schlief','schliefen','schlieft','schliefen']},
  {inf: 'geben',     sv: 'ge',      cat: 'Oregelbundna', aux: 'haben', part: 'gegeben',
   praes: ['gebe','gibst','gibt','geben','gebt','geben'], praet: ['gab','gabst','gab','gaben','gabt','gaben']},
  {inf: 'sprechen',  sv: 'tala',    cat: 'Oregelbundna', aux: 'haben', part: 'gesprochen',
   praes: ['spreche','sprichst','spricht','sprechen','sprecht','sprechen'], praet: ['sprach','sprachst','sprach','sprachen','spracht','sprachen']},
  {inf: 'nehmen',    sv: 'ta',      cat: 'Oregelbundna', aux: 'haben', part: 'genommen',
   praes: ['nehme','nimmst','nimmt','nehmen','nehmt','nehmen'], praet: ['nahm','nahmst','nahm','nahmen','nahmt','nahmen']},
  {inf: 'essen',     sv: 'äta',     cat: 'Oregelbundna', aux: 'haben', part: 'gegessen',
   praes: ['esse','isst','isst','essen','esst','essen'], praet: ['aß','aßest','aß','aßen','aßt','aßen']},
  {inf: 'sehen',     sv: 'se',      cat: 'Oregelbundna', aux: 'haben', part: 'gesehen',
   praes: ['sehe','siehst','sieht','sehen','seht','sehen'], praet: ['sah','sahst','sah','sahen','saht','sahen']},
  {inf: 'lesen',     sv: 'läsa',    cat: 'Oregelbundna', aux: 'haben', part: 'gelesen',
   praes: ['lese','liest','liest','lesen','lest','lesen'], praet: ['las','lasest','las','lasen','last','lasen']},
  {inf: 'gehen',     sv: 'gå',      cat: 'Oregelbundna', aux: 'sein',  part: 'gegangen',
   praes: ['gehe','gehst','geht','gehen','geht','gehen'], praet: ['ging','gingst','ging','gingen','gingt','gingen']},
  {inf: 'kommen',    sv: 'komma',   cat: 'Oregelbundna', aux: 'sein',  part: 'gekommen',
   praes: ['komme','kommst','kommt','kommen','kommt','kommen'], praet: ['kam','kamst','kam','kamen','kamt','kamen']},
  {inf: 'finden',    sv: 'hitta',   cat: 'Oregelbundna', aux: 'haben', part: 'gefunden',
   praes: ['finde','findest','findet','finden','findet','finden'], praet: ['fand','fandest','fand','fanden','fandet','fanden']},
  {inf: 'trinken',   sv: 'dricka',  cat: 'Oregelbundna', aux: 'haben', part: 'getrunken',
   praes: ['trinke','trinkst','trinkt','trinken','trinkt','trinken'], praet: ['trank','trankst','trank','tranken','trankt','tranken']},
  {inf: 'schreiben', sv: 'skriva',  cat: 'Oregelbundna', aux: 'haben', part: 'geschrieben',
   praes: ['schreibe','schreibst','schreibt','schreiben','schreibt','schreiben'], praet: ['schrieb','schriebst','schrieb','schrieben','schriebt','schrieben']},
  {inf: 'fliegen',   sv: 'flyga',   cat: 'Oregelbundna', aux: 'sein',  part: 'geflogen',
   praes: ['fliege','fliegst','fliegt','fliegen','fliegt','fliegen'], praet: ['flog','flogst','flog','flogen','flogt','flogen']},
  {inf: 'bleiben',   sv: 'stanna',  cat: 'Oregelbundna', aux: 'sein',  part: 'geblieben',
   praes: ['bleibe','bleibst','bleibt','bleiben','bleibt','bleiben'], praet: ['blieb','bliebst','blieb','blieben','bliebt','blieben']},
  {inf: 'helfen',    sv: 'hjälpa',  cat: 'Oregelbundna', aux: 'haben', part: 'geholfen',
   praes: ['helfe','hilfst','hilft','helfen','helft','helfen'], praet: ['half','halfst','half','halfen','halft','halfen']},

  // ── Blandade ──
  {inf: 'bringen', sv: 'ta med',  cat: 'Blandade', aux: 'haben', part: 'gebracht',
   praes: ['bringe','bringst','bringt','bringen','bringt','bringen'], praet: ['brachte','brachtest','brachte','brachten','brachtet','brachten']},
  {inf: 'denken',  sv: 'tänka',   cat: 'Blandade', aux: 'haben', part: 'gedacht',
   praes: ['denke','denkst','denkt','denken','denkt','denken'], praet: ['dachte','dachtest','dachte','dachten','dachtet','dachten']},
  {inf: 'kennen',  sv: 'känna',   cat: 'Blandade', aux: 'haben', part: 'gekannt',
   praes: ['kenne','kennst','kennt','kennen','kennt','kennen'], praet: ['kannte','kanntest','kannte','kannten','kanntet','kannten']},
  {inf: 'wissen',  sv: 'veta',    cat: 'Blandade', aux: 'haben', part: 'gewusst',
   praes: ['weiß','weißt','weiß','wissen','wisst','wissen'], praet: ['wusste','wusstest','wusste','wussten','wusstet','wussten']},
];

const CATS = ['Alla', 'Regelbundna', 'Oregelbundna', 'Modalverb', 'Hjälpverb', 'Blandade'];

function auxPraes(verb) { return verb.aux === 'sein' ? SEIN_PRAES : HABEN_PRAES; }
function auxPraet(verb) { return verb.aux === 'sein' ? SEIN_PRAET : HABEN_PRAET; }

function formsFor(verb, tense) {
  switch (tense) {
    case 'Präsens': return verb.praes;
    case 'Präteritum': return verb.praet;
    case 'Perfekt': return auxPraes(verb).map((a) => `${a} ${verb.part}`);
    case 'Plusquamperfekt': return auxPraet(verb).map((a) => `${a} ${verb.part}`);
    case 'Futur I': return WERDEN_PRAES.map((w) => `${w} ${verb.inf}`);
    case 'Futur II': return WERDEN_PRAES.map((w) => `${w} ${verb.part} ${verb.aux}`);
    default: return verb.praes;
  }
}

function cx(...p) { return p.filter(Boolean).join(' '); }
function norm(s) { return (s || '').trim().toLowerCase().replace(/ß/g, 'ss').replace(/\s+/g, ' '); }
function rand(n) { return Math.floor(Math.random() * n); }
function randomTense() { return TENSES[rand(TENSES.length)]; }

const EMPTY = ['', '', '', '', '', ''];

export default function ConjugationDrill() {
  const [cat, setCat] = useState('Alla');
  const [tenseSel, setTenseSel] = useState('Slumpmässig');
  const [vi, setVi] = useState(0); // index i VERBS (deterministiskt vid SSR)
  const [tense, setTense] = useState('Präsens'); // aktuellt tempus (deterministiskt vid SSR)
  const [answers, setAnswers] = useState(EMPTY);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState({right: 0, total: 0});

  const pool = useMemo(
    () => VERBS.map((v, i) => i).filter((i) => cat === 'Alla' || VERBS[i].cat === cat),
    [cat]
  );

  const verb = VERBS[vi];
  const forms = formsFor(verb, tense);

  const setCell = (i, val) => setAnswers((a) => a.map((x, j) => (j === i ? val : x)));

  const rightCount = answers.reduce((acc, val, i) => acc + (norm(val) === norm(forms[i]) ? 1 : 0), 0);

  function pickVerb(fromPool, prev) {
    if (fromPool.length === 0) return prev;
    let idx, tries = 0;
    do { idx = fromPool[rand(fromPool.length)]; tries++; } while (idx === prev && fromPool.length > 1 && tries < 12);
    return idx;
  }

  const check = useCallback(() => {
    if (checked) return;
    setChecked(true);
    setScore((s) => ({right: s.right + rightCount, total: s.total + PRONOUNS.length}));
  }, [checked, rightCount]);

  const next = useCallback(() => {
    setVi((prev) => pickVerb(pool, prev));
    setTense(tenseSel === 'Slumpmässig' ? randomTense() : tenseSel);
    setAnswers(EMPTY);
    setChecked(false);
  }, [pool, tenseSel]);

  const onCat = (c) => {
    setCat(c);
    const newPool = VERBS.map((v, i) => i).filter((i) => c === 'Alla' || VERBS[i].cat === c);
    setVi(pickVerb(newPool, -1));
    setTense(tenseSel === 'Slumpmässig' ? randomTense() : tenseSel);
    setAnswers(EMPTY);
    setChecked(false);
  };

  const onTense = (t) => {
    setTenseSel(t);
    setTense(t === 'Slumpmässig' ? randomTense() : t);
    setAnswers(EMPTY);
    setChecked(false);
  };

  const reset = useCallback(() => {
    setScore({right: 0, total: 0});
    setAnswers(EMPTY);
    setChecked(false);
    setVi(pickVerb(pool, -1));
    setTense(tenseSel === 'Slumpmässig' ? randomTense() : tenseSel);
  }, [pool, tenseSel]);

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
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Tempus</span>
          {['Slumpmässig', ...TENSES].map((t) => (
            <button key={t} className={cx(styles.chip, tenseSel === t && styles.chipActive)} onClick={() => onTense(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className={styles.head}>
        <span className={styles.headMain}>{verb.inf}</span>
        <span className={styles.pill}>{tense}</span>
        <div className={styles.headSub}>{verb.sv} · {verb.cat.toLowerCase()} · hjälpverb: {verb.aux}</div>
      </div>

      <div className={styles.grid2}>
        {PRONOUNS.map((pr, i) => {
          const ok = norm(answers[i]) === norm(forms[i]);
          return (
            <React.Fragment key={pr}>
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
        {checked && <span className={styles.summary}>{rightCount} / {PRONOUNS.length} rätt</span>}
      </div>
    </div>
  );
}
