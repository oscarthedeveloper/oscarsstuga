import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { Plus, Trash2 } from '@site/src/components/HP/icons';
import { useSyncedState, genId } from '@site/src/lib/useSyncedState';
import styles from './ordabok.module.css';

const ACCENTS = ['var(--blå)', 'var(--orange)', 'var(--lila)', 'var(--svart)'];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Ordabok() {
  const { value: cards, update, ready } = useSyncedState('ordabok_cards', []);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today());

  if (!ready) return null;

  function addCard(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const card = { id: genId(), title: title.trim(), date: date || today(), createdAt: new Date().toISOString(), words: [] };
    update((prev) => [...prev, card]);
    setTitle('');
    setDate(today());
    setShowForm(false);
  }

  function removeCard(id) {
    if (!window.confirm('Ta bort kortet och alla dess ord?')) return;
    update((prev) => prev.filter((c) => c.id !== id));
  }

  const sorted = [...cards].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <span className={styles.count}>{cards.length} kort</span>
        <button className={styles.btn} onClick={() => setShowForm((s) => !s)}>
          <Plus size={14} /> Nytt kort
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={addCard}>
          <div className={styles.formRow}>
            <input
              className={styles.control}
              placeholder="Rubrik, t.ex. Olika -ismer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <input
              className={styles.control}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ flex: '0 0 auto' }}
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btn}>Skapa</button>
            <button type="button" className={styles.btnGhost} onClick={() => setShowForm(false)}>Avbryt</button>
          </div>
        </form>
      )}

      {cards.length === 0 && !showForm && (
        <div className={styles.empty}>Inga kort ännu — skapa ditt första med “Nytt kort”.</div>
      )}

      <div className={styles.grid}>
        {sorted.map((c, i) => (
          <Link key={c.id} to={`/ordabok/kort?id=${c.id}`} className={styles.card}>
            <span className={styles.cardAccent} style={{ background: ACCENTS[i % ACCENTS.length] }} />
            <button
              className={styles.cardDelete}
              title="Ta bort kort"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeCard(c.id); }}
            >
              <Trash2 size={14} />
            </button>
            <div className={styles.cardTitle}>{c.title}</div>
            <div className={styles.cardDate}>{c.date}</div>
            <div className={styles.cardCount}>{(c.words || []).length} ord</div>
          </Link>
        ))}
        {cards.length > 0 && (
          <button className={styles.addTile} onClick={() => setShowForm(true)}>
            <Plus size={16} /> Nytt kort
          </button>
        )}
      </div>
    </div>
  );
}

