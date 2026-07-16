// Spansk verbmotor. Regelbundna verb genereras från reglerna; oregelbundna
// lagras som partiella override (endast de delar som avviker). Imperfekt
// konjunktiv härleds alltid ur preteritum (3:e pers. plural). Sammansatta
// tempus byggs av haber (i motsvarande enkla tempus) + oböjligt particip.

export const FINITE_PERSONS = ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos/ellas'];
export const IMPERATIVE_PERSONS = ['(tú)', '(usted)', '(nosotros)', '(vosotros)', '(ustedes)'];

export const TENSES = [
  { key: 'ind_pres', label: 'Presente', mood: 'Indikativ', simple: 'presente' },
  { key: 'ind_ppc', label: 'Pretérito perfecto', mood: 'Indikativ', comp: 'presente' },
  { key: 'ind_impf', label: 'Pretérito imperfecto', mood: 'Indikativ', simple: 'imperfecto' },
  { key: 'ind_plus', label: 'Pluscuamperfecto', mood: 'Indikativ', comp: 'imperfecto' },
  { key: 'ind_pret', label: 'Pretérito indefinido', mood: 'Indikativ', simple: 'preterito' },
  { key: 'ind_fut', label: 'Futuro simple', mood: 'Indikativ', simple: 'futuro' },
  { key: 'ind_futc', label: 'Futuro compuesto', mood: 'Indikativ', comp: 'futuro' },
  { key: 'cond_s', label: 'Condicional simple', mood: 'Konditionalis', simple: 'condicional' },
  { key: 'cond_c', label: 'Condicional compuesto', mood: 'Konditionalis', comp: 'condicional' },
  { key: 'subj_pres', label: 'Presente', mood: 'Konjunktiv', simple: 'subjPresente' },
  { key: 'subj_perf', label: 'Pretérito perfecto', mood: 'Konjunktiv', comp: 'subjPresente' },
  { key: 'subj_impf', label: 'Pretérito imperfecto', mood: 'Konjunktiv', simple: 'subjImperfecto' },
  { key: 'subj_plus', label: 'Pluscuamperfecto', mood: 'Konjunktiv', comp: 'subjImperfecto' },
  { key: 'imperativo', label: 'Imperativo', mood: 'Imperativ', simple: 'imperativo', imperative: true },
];

export const CATS = ['Alla', 'Regelbundna', 'Oregelbundna'];

const FUT_END = ['é', 'ás', 'á', 'emos', 'éis', 'án'];
const COND_END = ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'];

function accentLast(base) {
  const map = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
  for (let i = base.length - 1; i >= 0; i--) {
    if (map[base[i]]) return base.slice(0, i) + map[base[i]] + base.slice(i + 1);
  }
  return base;
}
function subjImpFromPret(pret) {
  const base = pret[5].replace(/ron$/, '');
  return [base + 'ra', base + 'ras', base + 'ra', accentLast(base) + 'ramos', base + 'rais', base + 'ran'];
}

function regular(inf) {
  const stem = inf.slice(0, -2);
  const end = inf.slice(-2);
  let presente, imperfecto, preterito, subjPresente;
  if (end === 'ar') {
    presente = ['o', 'as', 'a', 'amos', 'áis', 'an'].map((e) => stem + e);
    imperfecto = ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'].map((e) => stem + e);
    preterito = ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'].map((e) => stem + e);
    subjPresente = ['e', 'es', 'e', 'emos', 'éis', 'en'].map((e) => stem + e);
  } else if (end === 'er') {
    presente = ['o', 'es', 'e', 'emos', 'éis', 'en'].map((e) => stem + e);
    imperfecto = ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'].map((e) => stem + e);
    preterito = ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'].map((e) => stem + e);
    subjPresente = ['a', 'as', 'a', 'amos', 'áis', 'an'].map((e) => stem + e);
  } else {
    presente = ['o', 'es', 'e', 'imos', 'ís', 'en'].map((e) => stem + e);
    imperfecto = ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'].map((e) => stem + e);
    preterito = ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'].map((e) => stem + e);
    subjPresente = ['a', 'as', 'a', 'amos', 'áis', 'an'].map((e) => stem + e);
  }
  const futuro = FUT_END.map((e) => inf + e);
  const condicional = COND_END.map((e) => inf + e);
  const participio = end === 'ar' ? stem + 'ado' : stem + 'ido';
  return { presente, imperfecto, preterito, futuro, condicional, subjPresente, participio };
}

function simpleForms(v) {
  const inf = v.inf;
  const o = v.o || {};
  const base = regular(inf);
  const presente = o.pres || base.presente;
  const imperfecto = o.impf || base.imperfecto;
  const preterito = o.pret || base.preterito;
  const subjPresente = o.subjPres || base.subjPresente;
  const futuro = o.futStem ? FUT_END.map((e) => o.futStem + e) : base.futuro;
  const condicional = o.futStem ? COND_END.map((e) => o.futStem + e) : base.condicional;
  const participio = o.part || base.participio;
  const subjImperfecto = subjImpFromPret(preterito);

  let imperativo;
  if (o.imp === null) imperativo = null;
  else if (o.imp) imperativo = o.imp;
  else {
    const tu = o.impTu || presente[2];
    imperativo = [tu, subjPresente[2], subjPresente[3], inf.slice(0, -1) + 'd', subjPresente[5]];
  }
  return { presente, imperfecto, preterito, futuro, condicional, subjPresente, subjImperfecto, participio, imperativo };
}

export const VERBS = [
  // ── Regelbundna ──
  { inf: 'hablar', sv: 'tala', cat: 'Regelbundna' },
  { inf: 'trabajar', sv: 'arbeta', cat: 'Regelbundna' },
  { inf: 'estudiar', sv: 'studera', cat: 'Regelbundna' },
  { inf: 'comprar', sv: 'köpa', cat: 'Regelbundna' },
  { inf: 'tomar', sv: 'ta', cat: 'Regelbundna' },
  { inf: 'mirar', sv: 'titta', cat: 'Regelbundna' },
  { inf: 'comer', sv: 'äta', cat: 'Regelbundna' },
  { inf: 'beber', sv: 'dricka', cat: 'Regelbundna' },
  { inf: 'aprender', sv: 'lära sig', cat: 'Regelbundna' },
  { inf: 'vender', sv: 'sälja', cat: 'Regelbundna' },
  { inf: 'vivir', sv: 'bo/leva', cat: 'Regelbundna' },
  { inf: 'recibir', sv: 'ta emot', cat: 'Regelbundna' },

  // ── Oregelbundna ──
  { inf: 'ser', sv: 'vara', cat: 'Oregelbundna', o: {
    pres: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
    impf: ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
    pret: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
    subjPres: ['sea', 'seas', 'sea', 'seamos', 'seáis', 'sean'],
    impTu: 'sé' } },
  { inf: 'estar', sv: 'vara/befinna sig', cat: 'Oregelbundna', o: {
    pres: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
    pret: ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron'],
    subjPres: ['esté', 'estés', 'esté', 'estemos', 'estéis', 'estén'] } },
  { inf: 'haber', sv: 'ha (hjälpverb)', cat: 'Oregelbundna', o: {
    pres: ['he', 'has', 'ha', 'hemos', 'habéis', 'han'],
    pret: ['hube', 'hubiste', 'hubo', 'hubimos', 'hubisteis', 'hubieron'],
    futStem: 'habr',
    subjPres: ['haya', 'hayas', 'haya', 'hayamos', 'hayáis', 'hayan'],
    imp: null } },
  { inf: 'tener', sv: 'ha', cat: 'Oregelbundna', o: {
    pres: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
    pret: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron'],
    futStem: 'tendr',
    subjPres: ['tenga', 'tengas', 'tenga', 'tengamos', 'tengáis', 'tengan'],
    impTu: 'ten' } },
  { inf: 'hacer', sv: 'göra', cat: 'Oregelbundna', o: {
    pres: ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
    pret: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron'],
    futStem: 'har',
    subjPres: ['haga', 'hagas', 'haga', 'hagamos', 'hagáis', 'hagan'],
    impTu: 'haz', part: 'hecho' } },
  { inf: 'ir', sv: 'gå/åka', cat: 'Oregelbundna', o: {
    pres: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
    impf: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
    pret: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
    subjPres: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayáis', 'vayan'],
    imp: ['ve', 'vaya', 'vamos', 'id', 'vayan'] } },
  { inf: 'poder', sv: 'kunna', cat: 'Oregelbundna', o: {
    pres: ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden'],
    pret: ['pude', 'pudiste', 'pudo', 'pudimos', 'pudisteis', 'pudieron'],
    futStem: 'podr',
    subjPres: ['pueda', 'puedas', 'pueda', 'podamos', 'podáis', 'puedan'],
    imp: null } },
  { inf: 'querer', sv: 'vilja/älska', cat: 'Oregelbundna', o: {
    pres: ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren'],
    pret: ['quise', 'quisiste', 'quiso', 'quisimos', 'quisisteis', 'quisieron'],
    futStem: 'querr',
    subjPres: ['quiera', 'quieras', 'quiera', 'queramos', 'queráis', 'quieran'] } },
  { inf: 'decir', sv: 'säga', cat: 'Oregelbundna', o: {
    pres: ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'],
    pret: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijisteis', 'dijeron'],
    futStem: 'dir',
    subjPres: ['diga', 'digas', 'diga', 'digamos', 'digáis', 'digan'],
    impTu: 'di', part: 'dicho' } },
  { inf: 'ver', sv: 'se', cat: 'Oregelbundna', o: {
    pres: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
    impf: ['veía', 'veías', 'veía', 'veíamos', 'veíais', 'veían'],
    pret: ['vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron'],
    subjPres: ['vea', 'veas', 'vea', 'veamos', 'veáis', 'vean'],
    part: 'visto' } },
  { inf: 'dar', sv: 'ge', cat: 'Oregelbundna', o: {
    pres: ['doy', 'das', 'da', 'damos', 'dais', 'dan'],
    pret: ['di', 'diste', 'dio', 'dimos', 'disteis', 'dieron'],
    subjPres: ['dé', 'des', 'dé', 'demos', 'deis', 'den'] } },
  { inf: 'saber', sv: 'veta/kunna', cat: 'Oregelbundna', o: {
    pres: ['sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben'],
    pret: ['supe', 'supiste', 'supo', 'supimos', 'supisteis', 'supieron'],
    futStem: 'sabr',
    subjPres: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepáis', 'sepan'] } },
  { inf: 'poner', sv: 'lägga/sätta', cat: 'Oregelbundna', o: {
    pres: ['pongo', 'pones', 'pone', 'ponemos', 'ponéis', 'ponen'],
    pret: ['puse', 'pusiste', 'puso', 'pusimos', 'pusisteis', 'pusieron'],
    futStem: 'pondr',
    subjPres: ['ponga', 'pongas', 'ponga', 'pongamos', 'pongáis', 'pongan'],
    impTu: 'pon', part: 'puesto' } },
  { inf: 'venir', sv: 'komma', cat: 'Oregelbundna', o: {
    pres: ['vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen'],
    pret: ['vine', 'viniste', 'vino', 'vinimos', 'vinisteis', 'vinieron'],
    futStem: 'vendr',
    subjPres: ['venga', 'vengas', 'venga', 'vengamos', 'vengáis', 'vengan'],
    impTu: 'ven' } },
  { inf: 'salir', sv: 'gå ut', cat: 'Oregelbundna', o: {
    pres: ['salgo', 'sales', 'sale', 'salimos', 'salís', 'salen'],
    futStem: 'saldr',
    subjPres: ['salga', 'salgas', 'salga', 'salgamos', 'salgáis', 'salgan'],
    impTu: 'sal' } },
  { inf: 'conocer', sv: 'känna till', cat: 'Oregelbundna', o: {
    pres: ['conozco', 'conoces', 'conoce', 'conocemos', 'conocéis', 'conocen'],
    subjPres: ['conozca', 'conozcas', 'conozca', 'conozcamos', 'conozcáis', 'conozcan'] } },
  { inf: 'pedir', sv: 'be om', cat: 'Oregelbundna', o: {
    pres: ['pido', 'pides', 'pide', 'pedimos', 'pedís', 'piden'],
    pret: ['pedí', 'pediste', 'pidió', 'pedimos', 'pedisteis', 'pidieron'],
    subjPres: ['pida', 'pidas', 'pida', 'pidamos', 'pidáis', 'pidan'] } },
  { inf: 'dormir', sv: 'sova', cat: 'Oregelbundna', o: {
    pres: ['duermo', 'duermes', 'duerme', 'dormimos', 'dormís', 'duermen'],
    pret: ['dormí', 'dormiste', 'durmió', 'dormimos', 'dormisteis', 'durmieron'],
    subjPres: ['duerma', 'duermas', 'duerma', 'durmamos', 'durmáis', 'duerman'] } },
];

const _haber = VERBS.find((v) => v.inf === 'haber');
const HABER = simpleForms(_haber);

export function getForms(v, tenseKey) {
  const t = TENSES.find((x) => x.key === tenseKey) || TENSES[0];
  const sf = simpleForms(v);
  if (t.imperative) return sf.imperativo;
  if (t.simple) return sf[t.simple];
  return HABER[t.comp].map((a) => `${a} ${sf.participio}`);
}
