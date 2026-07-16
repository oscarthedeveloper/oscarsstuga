// Hjälpare: känner igen bestämd artikel i en text och dess genus.

export const LANGS = [
  { id: 'it', label: 'Italienska', flag: '🇮🇹' },
  { id: 'es', label: 'Spanska', flag: '🇪🇸' },
  { id: 'de', label: 'Tyska', flag: '🇩🇪' },
];

// Bestämda artiklar per språk (för att kunna ge dem särskilt utseende).
const ARTICLES = {
  it: ['il', 'lo', 'la', 'i', 'gli', 'le'],
  es: ['el', 'la', 'los', 'las'],
  de: ['der', 'die', 'das'],
};

// Genus per artikel (för dämpad tint).
const GENDER = {
  it: { m: ['il', 'lo', 'i', 'gli'], f: ['la', 'le'] },
  es: { m: ['el', 'los'], f: ['la', 'las'] },
  de: { m: ['der'], f: ['die'], n: ['das'] },
};

export function genderOf(lang, article) {
  const a = (article || '').toLowerCase().trim().replace(/[’´`]/g, "'");
  const g = GENDER[lang];
  if (!g || !a) return null;
  if (g.m && g.m.includes(a)) return 'm';
  if (g.f && g.f.includes(a)) return 'f';
  if (g.n && g.n.includes(a)) return 'n';
  return null;
}

// Delar upp en text i { article, rest } om den inleds med bestämd artikel.
// Hanterar även elision (l'acqua, l'uomo) för italienska.
export function splitArticle(lang, text) {
  const t = (text || '').trim();
  if (!t) return { article: null, rest: '' };

  if (lang === 'it') {
    const m = t.match(/^(l['’´`])\s*(.*)$/i);
    if (m) return { article: "l'", rest: m[2] };
  }
  const sp = t.indexOf(' ');
  const first = sp === -1 ? t : t.slice(0, sp);
  const rest = sp === -1 ? '' : t.slice(sp + 1);
  const set = ARTICLES[lang] || [];
  if (set.includes(first.toLowerCase())) return { article: first, rest };
  return { article: null, rest: t };
}

export function norm(s) {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/[’´`]/g, "'")
    .replace(/\s*'\s*/g, "'")
    .replace(/\s+/g, ' ');
}
