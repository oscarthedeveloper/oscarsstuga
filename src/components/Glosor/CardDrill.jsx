import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import { Plus, Trash2, Pencil, Check, X } from '@site/src/components/HP/icons';
import { useSyncedState, genId } from '@site/src/lib/useSyncedState';
import { splitArticle, genderOf, norm, LANGS } from './genus';
import styles from './glosor.module.css';

const BLANK = { sv: '', it: '', es: '', de: '' };

function genClass(g) {
  return g === 'm' ? styles.genM : g === 'f' ? styles.genF : g === 'n' ? styles.genN : styles.genNone;
}

// Renderar en översättning där bestämd artikel (la, el, il, die, l' …) blir
// större och versal för att belysa genus.
function Answer({ lang, text, placeholder }) {
  if (!text || !text.trim()) return <span className={styles.answerEmpty}>{placeholder || '—'}</span>;
  const { article, rest } = splitArticle(lang, text);
  return (
    <span className={styles.answerText}>
      {article && <span className={`${styles.art} ${genClass(genderOf(lang, article))}`}>{article}</span>}
      {article && rest ? ' ' : ''}
      {rest}
    </span>
  );
}

export default function CardDrill({ cardId }) {
  const { value: cards, update, ready } = useSyncedState('glosor_cards', []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);

  // Övning
  const [qi, setQi] = useState(0);
  const [inputs, setInputs] = useState({ it: '', es: '', de: '' });
  const [checked, setChecked] = useState(false);

  useEffect(() => { setInputs({ it: '', es: '', de: '' }); setChecked(false); }, [qi]);

  if (!ready) return null;

  const card = (Array.isArray(cards) ? cards : []).find((c) => c && c.id === cardId);

  if (!card) {
    return (
      <div className={styles.wrap}>
        <Link className={styles.back} to="/sprak/glosor/">← Tillbaka till Gemensam ordabok</Link>
        <div className={styles.empty}>Kortet hittades inte. Det kan ha tagits bort, eller så laddas molndata fortfarande.</div>
      </div>
    );
  }

  const entries = card.entries || [];
  const practiceList = entries.filter((e) => e && e.sv && LANGS.some((l) => (e[l.id] || '').trim()));
  const safeQi = practiceList.length ? qi % practiceList.length : 0;
  const current = practiceList[safeQi] || null;

  function patchCard(patch) {
    update((prev) => prev.map((c) => (c.id === cardId ? { ...c, ...patch } : c)));
  }

  function submitEntry(e) {
    e.preventDefault();
    if (!form.sv.trim()) return;
    const clean = { sv: form.sv.trim(), it: form.it.trim(), es: form.es.trim(), de: form.de.trim() };
    if (editId) {
      patchCard({ entries: entries.map((en) => (en.id === editId ? { ...en, ...clean } : en)) });
    } else {
      patchCard({ entries: [...entries, { id: genId(), ...clean }] });
    }
    setForm(BLANK);
    setEditId(null);
    setShowForm(false);
  }

  function startEdit(en) {
    setEditId(en.id);
    setForm({ sv: en.sv || '', it: en.it || '', es: en.es || '', de: en.de || '' });
    setShowForm(true);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function removeEntry(id) {
    patchCard({ entries: entries.filter((en) => en.id !== id) });
  }

  function next() {
    if (practiceList.length <= 1) { setChecked(false); setInputs({ it: '', es: '', de: '' }); return; }
    let n = Math.floor(Math.random() * practiceList.length);
    if (n === safeQi) n = (n + 1) % practiceList.length;
    setQi(n);
  }

  return (
    <div className={styles.wrap}>
      <Link className={styles.back} to="/sprak/glosor/">← Tillbaka till Gemensam ordabok</Link>
      <h1>{card.title}</h1>
      <p className={styles.detailDate}>{card.date} · {entries.length} glosor</p>

      {/* ── Öva ── */}
      <h2>Öva</h2>
      {!current ? (
        <div className={styles.empty}>Lägg till glosor nedan för att kunna öva.</div>
      ) : (
        <div className={styles.drill}>
          <div className={styles.promptWrap}>
            <span className={styles.promptLabel}>Svenska · {safeQi + 1} / {practiceList.length}</span>
            <div className={styles.prompt}>{current.sv}</div>
          </div>

          <div className={styles.cols}>
            {LANGS.map((l) => {
              const answer = (current[l.id] || '').trim();
              const has = answer !== '';
              const ok = has && norm(inputs[l.id]) === norm(answer);
              return (
                <div key={l.id} className={styles.col}>
                  <div className={styles.colHead}><span className={styles.flag}>{l.flag}</span> {l.label}</div>
                  {!has ? (
                    <div className={styles.answerEmpty}>—</div>
                  ) : (
                    <>
                      <input
                        className={styles.input}
                        value={inputs[l.id]}
                        onChange={(e) => setInputs((p) => ({ ...p, [l.id]: e.target.value }))}
                        placeholder="skriv översättning"
                        disabled={checked}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !checked) setChecked(true); }}
                        aria-label={l.label}
                      />
                      <div className={styles.preview}>
                        <Answer lang={l.id} text={inputs[l.id]} placeholder=" " />
                      </div>
                      {checked && (
                        <div className={`${styles.facit} ${ok ? styles.facitOk : styles.facitBad}`}>
                          <span className={styles.mark}>{ok ? <Check size={16} /> : <X size={16} />}</span>
                          <Answer lang={l.id} text={answer} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.controls}>
            {!checked ? (
              <button className={styles.btn} onClick={() => setChecked(true)}>Rätta</button>
            ) : (
              <button className={styles.btn} onClick={next}>Nästa →</button>
            )}
            <button className={styles.btnGhost} onClick={next}>Hoppa över</button>
          </div>
        </div>
      )}

      {/* ── Hantera ── */}
      <div className={styles.toolbar} style={{ marginTop: '2.5rem' }}>
        <span className={styles.count}>Glosor i kortet</span>
        <button className={styles.btn} onClick={() => { setEditId(null); setForm(BLANK); setShowForm((s) => !s); }}>
          <Plus size={14} /> Ny glosa
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={submitEntry}>
          <div className={styles.formRow}>
            <input className={styles.control} placeholder="Svensk term, t.ex. hus" value={form.sv} onChange={(e) => setForm((f) => ({ ...f, sv: e.target.value }))} autoFocus />
          </div>
          <div className={styles.formCols}>
            {LANGS.map((l) => (
              <div key={l.id} className={styles.formCol}>
                <label className={styles.formColHead}><span className={styles.flag}>{l.flag}</span> {l.label}</label>
                <input className={styles.control} placeholder="t.ex. la casa" value={form[l.id]} onChange={(e) => setForm((f) => ({ ...f, [l.id]: e.target.value }))} />
                <div className={styles.preview}><Answer lang={l.id} text={form[l.id]} placeholder=" " /></div>
              </div>
            ))}
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btn}><Check size={14} /> {editId ? 'Spara' : 'Lägg till'}</button>
            <button type="button" className={styles.btnGhost} onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Avbryt</button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <div className={styles.empty}>Inga glosor ännu — lägg till din första med “Ny glosa”.</div>
      ) : (
        <div className={styles.entryList}>
          {entries.map((en) => (
            <div key={en.id} className={styles.entryRow}>
              <div className={styles.entrySv}>{en.sv}</div>
              <div className={styles.entryLangs}>
                {LANGS.map((l) => (
                  <div key={l.id} className={styles.entryLang}>
                    <span className={styles.entryFlag}>{l.flag}</span>
                    <Answer lang={l.id} text={en[l.id]} />
                  </div>
                ))}
              </div>
              <div className={styles.entryActions}>
                <button className={styles.iconBtn} title="Redigera" onClick={() => startEdit(en)}><Pencil size={14} /></button>
                <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Ta bort" onClick={() => removeEntry(en.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
