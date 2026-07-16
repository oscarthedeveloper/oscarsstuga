// Italiensk verbmotor. Regelbundna verb genereras från reglerna; oregelbundna
// lagras explicit (eller som regelbunden + "over" för partiella avvikelser).
// Sammansatta tempus byggs av hjälpverb (avere/essere) + particip.

export const FINITE_PERSONS = ['io', 'tu', 'lui/lei', 'noi', 'voi', 'loro'];
export const IMPERATIVE_PERSONS = ['(tu)', '(Lei)', '(noi)', '(voi)', '(Loro)'];

export const TENSES = [
  { key: 'ind_pres', label: 'Presente', mood: 'Indikativ', simple: 'presente' },
  { key: 'ind_ppr', label: 'Passato prossimo', mood: 'Indikativ', comp: 'presente' },
  { key: 'ind_impf', label: 'Imperfetto', mood: 'Indikativ', simple: 'imperfetto' },
  { key: 'ind_tpr', label: 'Trapassato prossimo', mood: 'Indikativ', comp: 'imperfetto' },
  { key: 'ind_prem', label: 'Passato remoto', mood: 'Indikativ', simple: 'passatoRemoto' },
  { key: 'ind_trem', label: 'Trapassato remoto', mood: 'Indikativ', comp: 'passatoRemoto' },
  { key: 'ind_fut', label: 'Futuro semplice', mood: 'Indikativ', simple: 'futuro' },
  { key: 'ind_futa', label: 'Futuro anteriore', mood: 'Indikativ', comp: 'futuro' },
  { key: 'cong_pres', label: 'Presente', mood: 'Konjunktiv', simple: 'congPresente' },
  { key: 'cong_pass', label: 'Passato', mood: 'Konjunktiv', comp: 'congPresente' },
  { key: 'cong_impf', label: 'Imperfetto', mood: 'Konjunktiv', simple: 'congImperfetto' },
  { key: 'cong_trap', label: 'Trapassato', mood: 'Konjunktiv', comp: 'congImperfetto' },
  { key: 'cond_pres', label: 'Presente', mood: 'Konditionalis', simple: 'condizionale' },
  { key: 'cond_pass', label: 'Passato', mood: 'Konditionalis', comp: 'condizionale' },
  { key: 'imperativo', label: 'Imperativ', mood: 'Imperativ', simple: 'imperativo', imperative: true },
];

export const CATS = ['Alla', 'Regelbundna', 'Oregelbundna'];

function conjugateRegular(v) {
  const inf = v.inf;
  const stem = inf.slice(0, -3);
  const end = inf.slice(-3);
  const isc = v.kind === 'ireisc';
  const futStem = end === 'ire' ? stem + 'ir' : stem + 'er';

  let presente;
  if (end === 'are') presente = ['o', 'i', 'a', 'iamo', 'ate', 'ano'].map((e) => stem + e);
  else if (end === 'ere') presente = ['o', 'i', 'e', 'iamo', 'ete', 'ono'].map((e) => stem + e);
  else if (isc) presente = [stem + 'isco', stem + 'isci', stem + 'isce', stem + 'iamo', stem + 'ite', stem + 'iscono'];
  else presente = ['o', 'i', 'e', 'iamo', 'ite', 'ono'].map((e) => stem + e);

  const impStem = end === 'are' ? 'av' : end === 'ere' ? 'ev' : 'iv';
  const imperfetto = ['o', 'i', 'a', 'amo', 'ate', 'ano'].map((e) => stem + impStem + e);

  let passatoRemoto;
  if (end === 'are') passatoRemoto = ['ai', 'asti', 'ò', 'ammo', 'aste', 'arono'].map((e) => stem + e);
  else if (end === 'ere') passatoRemoto = ['ei', 'esti', 'é', 'emmo', 'este', 'erono'].map((e) => stem + e);
  else passatoRemoto = ['ii', 'isti', 'ì', 'immo', 'iste', 'irono'].map((e) => stem + e);

  const futuro = ['ò', 'ai', 'à', 'emo', 'ete', 'anno'].map((e) => futStem + e);

  let congPresente;
  if (end === 'are') congPresente = ['i', 'i', 'i', 'iamo', 'iate', 'ino'].map((e) => stem + e);
  else if (isc) congPresente = [stem + 'isca', stem + 'isca', stem + 'isca', stem + 'iamo', stem + 'iate', stem + 'iscano'];
  else congPresente = ['a', 'a', 'a', 'iamo', 'iate', 'ano'].map((e) => stem + e);

  const ciV = end === 'are' ? 'a' : end === 'ere' ? 'e' : 'i';
  const congImperfetto = ['ssi', 'ssi', 'sse', 'ssimo', 'ste', 'ssero'].map((e) => stem + ciV + e);

  const condizionale = ['ei', 'esti', 'ebbe', 'emmo', 'este', 'ebbero'].map((e) => futStem + e);

  let imperativo;
  if (end === 'are') imperativo = [stem + 'a', stem + 'i', stem + 'iamo', stem + 'ate', stem + 'ino'];
  else if (isc) imperativo = [stem + 'isci', stem + 'isca', stem + 'iamo', stem + 'ite', stem + 'iscano'];
  else if (end === 'ere') imperativo = [stem + 'i', stem + 'a', stem + 'iamo', stem + 'ete', stem + 'ano'];
  else imperativo = [stem + 'i', stem + 'a', stem + 'iamo', stem + 'ite', stem + 'ano'];

  const participio = end === 'are' ? stem + 'ato' : end === 'ere' ? stem + 'uto' : stem + 'ito';
  const gerundio = end === 'are' ? stem + 'ando' : stem + 'endo';

  return { presente, imperfetto, passatoRemoto, futuro, congPresente, congImperfetto, condizionale, imperativo, participio, gerundio };
}

const IRREGULAR = {
  essere: {
    presente: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
    imperfetto: ['ero', 'eri', 'era', 'eravamo', 'eravate', 'erano'],
    passatoRemoto: ['fui', 'fosti', 'fu', 'fummo', 'foste', 'furono'],
    futuro: ['sarò', 'sarai', 'sarà', 'saremo', 'sarete', 'saranno'],
    congPresente: ['sia', 'sia', 'sia', 'siamo', 'siate', 'siano'],
    congImperfetto: ['fossi', 'fossi', 'fosse', 'fossimo', 'foste', 'fossero'],
    condizionale: ['sarei', 'saresti', 'sarebbe', 'saremmo', 'sareste', 'sarebbero'],
    imperativo: ['sii', 'sia', 'siamo', 'siate', 'siano'], participio: 'stato', gerundio: 'essendo',
  },
  avere: {
    presente: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'],
    imperfetto: ['avevo', 'avevi', 'aveva', 'avevamo', 'avevate', 'avevano'],
    passatoRemoto: ['ebbi', 'avesti', 'ebbe', 'avemmo', 'aveste', 'ebbero'],
    futuro: ['avrò', 'avrai', 'avrà', 'avremo', 'avrete', 'avranno'],
    congPresente: ['abbia', 'abbia', 'abbia', 'abbiamo', 'abbiate', 'abbiano'],
    congImperfetto: ['avessi', 'avessi', 'avesse', 'avessimo', 'aveste', 'avessero'],
    condizionale: ['avrei', 'avresti', 'avrebbe', 'avremmo', 'avreste', 'avrebbero'],
    imperativo: ['abbi', 'abbia', 'abbiamo', 'abbiate', 'abbiano'], participio: 'avuto', gerundio: 'avendo',
  },
  andare: {
    presente: ['vado', 'vai', 'va', 'andiamo', 'andate', 'vanno'],
    imperfetto: ['andavo', 'andavi', 'andava', 'andavamo', 'andavate', 'andavano'],
    passatoRemoto: ['andai', 'andasti', 'andò', 'andammo', 'andaste', 'andarono'],
    futuro: ['andrò', 'andrai', 'andrà', 'andremo', 'andrete', 'andranno'],
    congPresente: ['vada', 'vada', 'vada', 'andiamo', 'andiate', 'vadano'],
    congImperfetto: ['andassi', 'andassi', 'andasse', 'andassimo', 'andaste', 'andassero'],
    condizionale: ['andrei', 'andresti', 'andrebbe', 'andremmo', 'andreste', 'andrebbero'],
    imperativo: ["va'", 'vada', 'andiamo', 'andate', 'vadano'], participio: 'andato', gerundio: 'andando',
  },
  fare: {
    presente: ['faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno'],
    imperfetto: ['facevo', 'facevi', 'faceva', 'facevamo', 'facevate', 'facevano'],
    passatoRemoto: ['feci', 'facesti', 'fece', 'facemmo', 'faceste', 'fecero'],
    futuro: ['farò', 'farai', 'farà', 'faremo', 'farete', 'faranno'],
    congPresente: ['faccia', 'faccia', 'faccia', 'facciamo', 'facciate', 'facciano'],
    congImperfetto: ['facessi', 'facessi', 'facesse', 'facessimo', 'faceste', 'facessero'],
    condizionale: ['farei', 'faresti', 'farebbe', 'faremmo', 'fareste', 'farebbero'],
    imperativo: ["fa'", 'faccia', 'facciamo', 'fate', 'facciano'], participio: 'fatto', gerundio: 'facendo',
  },
  stare: {
    presente: ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno'],
    imperfetto: ['stavo', 'stavi', 'stava', 'stavamo', 'stavate', 'stavano'],
    passatoRemoto: ['stetti', 'stesti', 'stette', 'stemmo', 'steste', 'stettero'],
    futuro: ['starò', 'starai', 'starà', 'staremo', 'starete', 'staranno'],
    congPresente: ['stia', 'stia', 'stia', 'stiamo', 'stiate', 'stiano'],
    congImperfetto: ['stessi', 'stessi', 'stesse', 'stessimo', 'steste', 'stessero'],
    condizionale: ['starei', 'staresti', 'starebbe', 'staremmo', 'stareste', 'starebbero'],
    imperativo: ["sta'", 'stia', 'stiamo', 'state', 'stiano'], participio: 'stato', gerundio: 'stando',
  },
  dare: {
    presente: ['do', 'dai', 'dà', 'diamo', 'date', 'danno'],
    imperfetto: ['davo', 'davi', 'dava', 'davamo', 'davate', 'davano'],
    passatoRemoto: ['diedi', 'desti', 'diede', 'demmo', 'deste', 'diedero'],
    futuro: ['darò', 'darai', 'darà', 'daremo', 'darete', 'daranno'],
    congPresente: ['dia', 'dia', 'dia', 'diamo', 'diate', 'diano'],
    congImperfetto: ['dessi', 'dessi', 'desse', 'dessimo', 'deste', 'dessero'],
    condizionale: ['darei', 'daresti', 'darebbe', 'daremmo', 'dareste', 'darebbero'],
    imperativo: ["da'", 'dia', 'diamo', 'date', 'diano'], participio: 'dato', gerundio: 'dando',
  },
  dire: {
    presente: ['dico', 'dici', 'dice', 'diciamo', 'dite', 'dicono'],
    imperfetto: ['dicevo', 'dicevi', 'diceva', 'dicevamo', 'dicevate', 'dicevano'],
    passatoRemoto: ['dissi', 'dicesti', 'disse', 'dicemmo', 'diceste', 'dissero'],
    futuro: ['dirò', 'dirai', 'dirà', 'diremo', 'direte', 'diranno'],
    congPresente: ['dica', 'dica', 'dica', 'diciamo', 'diciate', 'dicano'],
    congImperfetto: ['dicessi', 'dicessi', 'dicesse', 'dicessimo', 'diceste', 'dicessero'],
    condizionale: ['direi', 'diresti', 'direbbe', 'diremmo', 'direste', 'direbbero'],
    imperativo: ["di'", 'dica', 'diciamo', 'dite', 'dicano'], participio: 'detto', gerundio: 'dicendo',
  },
  potere: {
    presente: ['posso', 'puoi', 'può', 'possiamo', 'potete', 'possono'],
    imperfetto: ['potevo', 'potevi', 'poteva', 'potevamo', 'potevate', 'potevano'],
    passatoRemoto: ['potei', 'potesti', 'poté', 'potemmo', 'poteste', 'poterono'],
    futuro: ['potrò', 'potrai', 'potrà', 'potremo', 'potrete', 'potranno'],
    congPresente: ['possa', 'possa', 'possa', 'possiamo', 'possiate', 'possano'],
    congImperfetto: ['potessi', 'potessi', 'potesse', 'potessimo', 'poteste', 'potessero'],
    condizionale: ['potrei', 'potresti', 'potrebbe', 'potremmo', 'potreste', 'potrebbero'],
    imperativo: null, participio: 'potuto', gerundio: 'potendo',
  },
  volere: {
    presente: ['voglio', 'vuoi', 'vuole', 'vogliamo', 'volete', 'vogliono'],
    imperfetto: ['volevo', 'volevi', 'voleva', 'volevamo', 'volevate', 'volevano'],
    passatoRemoto: ['volli', 'volesti', 'volle', 'volemmo', 'voleste', 'vollero'],
    futuro: ['vorrò', 'vorrai', 'vorrà', 'vorremo', 'vorrete', 'vorranno'],
    congPresente: ['voglia', 'voglia', 'voglia', 'vogliamo', 'vogliate', 'vogliano'],
    congImperfetto: ['volessi', 'volessi', 'volesse', 'volessimo', 'voleste', 'volessero'],
    condizionale: ['vorrei', 'vorresti', 'vorrebbe', 'vorremmo', 'vorreste', 'vorrebbero'],
    imperativo: null, participio: 'voluto', gerundio: 'volendo',
  },
  dovere: {
    presente: ['devo', 'devi', 'deve', 'dobbiamo', 'dovete', 'devono'],
    imperfetto: ['dovevo', 'dovevi', 'doveva', 'dovevamo', 'dovevate', 'dovevano'],
    passatoRemoto: ['dovetti', 'dovesti', 'dovette', 'dovemmo', 'doveste', 'dovettero'],
    futuro: ['dovrò', 'dovrai', 'dovrà', 'dovremo', 'dovrete', 'dovranno'],
    congPresente: ['debba', 'debba', 'debba', 'dobbiamo', 'dobbiate', 'debbano'],
    congImperfetto: ['dovessi', 'dovessi', 'dovesse', 'dovessimo', 'doveste', 'dovessero'],
    condizionale: ['dovrei', 'dovresti', 'dovrebbe', 'dovremmo', 'dovreste', 'dovrebbero'],
    imperativo: null, participio: 'dovuto', gerundio: 'dovendo',
  },
  sapere: {
    presente: ['so', 'sai', 'sa', 'sappiamo', 'sapete', 'sanno'],
    imperfetto: ['sapevo', 'sapevi', 'sapeva', 'sapevamo', 'sapevate', 'sapevano'],
    passatoRemoto: ['seppi', 'sapesti', 'seppe', 'sapemmo', 'sapeste', 'seppero'],
    futuro: ['saprò', 'saprai', 'saprà', 'sapremo', 'saprete', 'sapranno'],
    congPresente: ['sappia', 'sappia', 'sappia', 'sappiamo', 'sappiate', 'sappiano'],
    congImperfetto: ['sapessi', 'sapessi', 'sapesse', 'sapessimo', 'sapeste', 'sapessero'],
    condizionale: ['saprei', 'sapresti', 'saprebbe', 'sapremmo', 'sapreste', 'saprebbero'],
    imperativo: ['sappi', 'sappia', 'sappiamo', 'sappiate', 'sappiano'], participio: 'saputo', gerundio: 'sapendo',
  },
  vedere: {
    presente: ['vedo', 'vedi', 'vede', 'vediamo', 'vedete', 'vedono'],
    imperfetto: ['vedevo', 'vedevi', 'vedeva', 'vedevamo', 'vedevate', 'vedevano'],
    passatoRemoto: ['vidi', 'vedesti', 'vide', 'vedemmo', 'vedeste', 'videro'],
    futuro: ['vedrò', 'vedrai', 'vedrà', 'vedremo', 'vedrete', 'vedranno'],
    congPresente: ['veda', 'veda', 'veda', 'vediamo', 'vediate', 'vedano'],
    congImperfetto: ['vedessi', 'vedessi', 'vedesse', 'vedessimo', 'vedeste', 'vedessero'],
    condizionale: ['vedrei', 'vedresti', 'vedrebbe', 'vedremmo', 'vedreste', 'vedrebbero'],
    imperativo: ['vedi', 'veda', 'vediamo', 'vedete', 'vedano'], participio: 'visto', gerundio: 'vedendo',
  },
  venire: {
    presente: ['vengo', 'vieni', 'viene', 'veniamo', 'venite', 'vengono'],
    imperfetto: ['venivo', 'venivi', 'veniva', 'venivamo', 'venivate', 'venivano'],
    passatoRemoto: ['venni', 'venisti', 'venne', 'venimmo', 'veniste', 'vennero'],
    futuro: ['verrò', 'verrai', 'verrà', 'verremo', 'verrete', 'verranno'],
    congPresente: ['venga', 'venga', 'venga', 'veniamo', 'veniate', 'vengano'],
    congImperfetto: ['venissi', 'venissi', 'venisse', 'venissimo', 'veniste', 'venissero'],
    condizionale: ['verrei', 'verresti', 'verrebbe', 'verremmo', 'verreste', 'verrebbero'],
    imperativo: ['vieni', 'venga', 'veniamo', 'venite', 'vengano'], participio: 'venuto', gerundio: 'venendo',
  },
  uscire: {
    presente: ['esco', 'esci', 'esce', 'usciamo', 'uscite', 'escono'],
    imperfetto: ['uscivo', 'uscivi', 'usciva', 'uscivamo', 'uscivate', 'uscivano'],
    passatoRemoto: ['uscii', 'uscisti', 'uscì', 'uscimmo', 'usciste', 'uscirono'],
    futuro: ['uscirò', 'uscirai', 'uscirà', 'usciremo', 'uscirete', 'usciranno'],
    congPresente: ['esca', 'esca', 'esca', 'usciamo', 'usciate', 'escano'],
    congImperfetto: ['uscissi', 'uscissi', 'uscisse', 'uscissimo', 'usciste', 'uscissero'],
    condizionale: ['uscirei', 'usciresti', 'uscirebbe', 'usciremmo', 'uscireste', 'uscirebbero'],
    imperativo: ['esci', 'esca', 'usciamo', 'uscite', 'escano'], participio: 'uscito', gerundio: 'uscendo',
  },
  bere: {
    presente: ['bevo', 'bevi', 'beve', 'beviamo', 'bevete', 'bevono'],
    imperfetto: ['bevevo', 'bevevi', 'beveva', 'bevevamo', 'bevevate', 'bevevano'],
    passatoRemoto: ['bevvi', 'bevesti', 'bevve', 'bevemmo', 'beveste', 'bevvero'],
    futuro: ['berrò', 'berrai', 'berrà', 'berremo', 'berrete', 'berranno'],
    congPresente: ['beva', 'beva', 'beva', 'beviamo', 'beviate', 'bevano'],
    congImperfetto: ['bevessi', 'bevessi', 'bevesse', 'bevessimo', 'beveste', 'bevessero'],
    condizionale: ['berrei', 'berresti', 'berrebbe', 'berremmo', 'berreste', 'berrebbero'],
    imperativo: ['bevi', 'beva', 'beviamo', 'bevete', 'bevano'], participio: 'bevuto', gerundio: 'bevendo',
  },
};

const AUX = { avere: IRREGULAR.avere, essere: IRREGULAR.essere };

export const VERBS = [
  // ── Regelbundna ──
  { inf: 'parlare', sv: 'tala', kind: 'are', aux: 'avere', cat: 'Regelbundna' },
  { inf: 'guardare', sv: 'titta', kind: 'are', aux: 'avere', cat: 'Regelbundna' },
  { inf: 'lavorare', sv: 'arbeta', kind: 'are', aux: 'avere', cat: 'Regelbundna' },
  { inf: 'arrivare', sv: 'anlända', kind: 'are', aux: 'essere', cat: 'Regelbundna' },
  { inf: 'tornare', sv: 'återvända', kind: 'are', aux: 'essere', cat: 'Regelbundna' },
  { inf: 'credere', sv: 'tro', kind: 'ere', aux: 'avere', cat: 'Regelbundna' },
  { inf: 'vendere', sv: 'sälja', kind: 'ere', aux: 'avere', cat: 'Regelbundna' },
  { inf: 'dormire', sv: 'sova', kind: 'ire', aux: 'avere', cat: 'Regelbundna' },
  { inf: 'sentire', sv: 'höra/känna', kind: 'ire', aux: 'avere', cat: 'Regelbundna' },
  { inf: 'partire', sv: 'åka iväg', kind: 'ire', aux: 'essere', cat: 'Regelbundna' },
  { inf: 'finire', sv: 'avsluta', kind: 'ireisc', aux: 'avere', cat: 'Regelbundna' },
  { inf: 'capire', sv: 'förstå', kind: 'ireisc', aux: 'avere', cat: 'Regelbundna' },
  // ── Oregelbundna ──
  { inf: 'essere', sv: 'vara', aux: 'essere', cat: 'Oregelbundna', irr: 'essere' },
  { inf: 'avere', sv: 'ha', aux: 'avere', cat: 'Oregelbundna', irr: 'avere' },
  { inf: 'andare', sv: 'gå/åka', aux: 'essere', cat: 'Oregelbundna', irr: 'andare' },
  { inf: 'fare', sv: 'göra', aux: 'avere', cat: 'Oregelbundna', irr: 'fare' },
  { inf: 'stare', sv: 'stå/må', aux: 'essere', cat: 'Oregelbundna', irr: 'stare' },
  { inf: 'dare', sv: 'ge', aux: 'avere', cat: 'Oregelbundna', irr: 'dare' },
  { inf: 'dire', sv: 'säga', aux: 'avere', cat: 'Oregelbundna', irr: 'dire' },
  { inf: 'potere', sv: 'kunna', aux: 'avere', cat: 'Oregelbundna', irr: 'potere' },
  { inf: 'volere', sv: 'vilja', aux: 'avere', cat: 'Oregelbundna', irr: 'volere' },
  { inf: 'dovere', sv: 'måste', aux: 'avere', cat: 'Oregelbundna', irr: 'dovere' },
  { inf: 'sapere', sv: 'veta/kunna', aux: 'avere', cat: 'Oregelbundna', irr: 'sapere' },
  { inf: 'vedere', sv: 'se', aux: 'avere', cat: 'Oregelbundna', irr: 'vedere' },
  { inf: 'venire', sv: 'komma', aux: 'essere', cat: 'Oregelbundna', irr: 'venire' },
  { inf: 'uscire', sv: 'gå ut', aux: 'essere', cat: 'Oregelbundna', irr: 'uscire' },
  { inf: 'bere', sv: 'dricka', aux: 'avere', cat: 'Oregelbundna', irr: 'bere' },
  // ── Delvis oregelbundna (regelbunden + over) ──
  { inf: 'leggere', sv: 'läsa', kind: 'ere', aux: 'avere', cat: 'Oregelbundna',
    over: { passatoRemoto: ['lessi', 'leggesti', 'lesse', 'leggemmo', 'leggeste', 'lessero'], participio: 'letto' } },
  { inf: 'prendere', sv: 'ta', kind: 'ere', aux: 'avere', cat: 'Oregelbundna',
    over: { passatoRemoto: ['presi', 'prendesti', 'prese', 'prendemmo', 'prendeste', 'presero'], participio: 'preso' } },
  { inf: 'mettere', sv: 'sätta/lägga', kind: 'ere', aux: 'avere', cat: 'Oregelbundna',
    over: { passatoRemoto: ['misi', 'mettesti', 'mise', 'mettemmo', 'metteste', 'misero'], participio: 'messo' } },
];

function simpleForms(v) {
  if (v.irr) return IRREGULAR[v.irr];
  const base = conjugateRegular(v);
  return v.over ? { ...base, ...v.over } : base;
}

function pluralPart(p) { return p.replace(/o$/, 'i'); }
function participleFor(v, i) {
  const sf = simpleForms(v);
  if (v.aux === 'essere') return i < 3 ? sf.participio : pluralPart(sf.participio);
  return sf.participio;
}

// Returnerar formerna (6 för finita tempus, 5 för imperativ) eller null om formen saknas.
export function getForms(v, tenseKey) {
  const t = TENSES.find((x) => x.key === tenseKey) || TENSES[0];
  const sf = simpleForms(v);
  if (t.imperative) return sf.imperativo || null;
  if (t.simple) return sf[t.simple];
  const aux = AUX[v.aux][t.comp];
  return aux.map((a, i) => `${a} ${participleFor(v, i)}`);
}
