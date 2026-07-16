import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { Plus, Trash2, Pencil, Check } from '@site/src/components/HP/icons';
import { useSyncedState, genId } from '@site/src/lib/useSyncedState';
import WordPractice from './WordPractice';
import styles from './ordabok.module.css';

const BLANK = { word: '', definition: '', example: '' };

export default function CardDetail({ cardId }) {
  const { value: cards, update, ready } = useSyncedState('ordabok_cards', []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);

  if (!ready) return null;

  const card = cards.find((c) => c.id === cardId);

  if (!card) {
    return (
      <div className={styles.wrap}>
        <Link className={styles.back} to="/forstasprak/svenska/ordabok">← Tillbaka till Ordaboken</Link>
        <div className={styles.empty}>Kortet hittades inte. Det kan ha tagits bort, eller så laddas molndata fortfarande.</div>
      </div>
    );
  }

  const words = card.words || [];

  function patchCard(patch) {
    update((prev) => prev.map((c) => (c.id === cardId ? { ...c, ...patch } : c)));
  }

  function submitWord(e) {
    e.preventDefault();
    if (!form.word.trim()) return;
    if (editId) {
      patchCard({ words: words.map((w) => (w.id === editId ? { ...w, ...form, word: form.word.trim() } : w)) });
    } else {
      const w = { id: genId(), word: form.word.trim(), definition: form.definition.trim(), example: form.example.trim() };
      patchCard({ words: [...words, w] });
    }
    setForm(BLANK);
    setEditId(null);
    setShowForm(false);
  }

  function startEdit(w) {
    setEditId(w.id);
    setForm({ word: w.word, definition: w.definition ?? '', example: w.example ?? '' });
    setShowForm(true);
  }

  function removeWord(id) {
    patchCard({ words: words.filter((w) => w.id !== id) });
  }

  return (
    <div className={styles.wrap}>
      <Link className={styles.back} to="/forstasprak/svenska/ordabok">← Tillbaka till Ordaboken</Link>
      <h1>{card.title}</h1>
      <p className={styles.detailDate}>{card.date} · {words.length} ord</p>

      <div className={styles.toolbar}>
        <span className={styles.count}>Ord i kortet</span>
        <button className={styles.btn} onClick={() => { setEditId(null); setForm(BLANK); setShowForm((s) => !s); }}>
          <Plus size={14} /> Nytt ord
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={submitWord}>
          <div className={styles.formRow}>
            <input className={styles.control} placeholder="Ord" value={form.word} onChange={(e) => setForm((f) => ({ ...f, word: e.target.value }))} autoFocus />
          </div>
          <div className={styles.formRow} style={{ marginTop: '0.6rem' }}>
            <input className={styles.control} placeholder="Definition" value={form.definition} onChange={(e) => setForm((f) => ({ ...f, definition: e.target.value }))} />
          </div>
          <div className={styles.formRow} style={{ marginTop: '0.6rem' }}>
            <textarea className={`${styles.control} ${styles.textarea}`} placeholder="Exempelmening" value={form.example} onChange={(e) => setForm((f) => ({ ...f, example: e.target.value }))} />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btn}><Check size={14} /> {editId ? 'Spara' : 'Lägg till'}</button>
            <button type="button" className={styles.btnGhost} onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Avbryt</button>
          </div>
        </form>
      )}

      {words.length === 0 ? (
        <div className={styles.empty}>Inga ord ännu — lägg till ditt första med “Nytt ord”.</div>
      ) : (
        <div className={styles.wordList}>
          {words.map((w) => (
            <div key={w.id} className={styles.wordRow}>
              <div className={styles.wordTop}>
                <span className={styles.wordWord}>{w.word}</span>
                <span className={styles.wordActions}>
                  <button className={styles.iconBtn} title="Redigera" onClick={() => startEdit(w)}><Pencil size={14} /></button>
                  <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Ta bort" onClick={() => removeWord(w.id)}><Trash2 size={14} /></button>
                </span>
              </div>
              {w.definition && <p className={styles.wordDef}>{w.definition}</p>}
              {w.example && <p className={styles.wordEx}>”{w.example}”</p>}
            </div>
          ))}
        </div>
      )}

      <h2>Öva</h2>
      <WordPractice words={words} />
    </div>
  );
}
