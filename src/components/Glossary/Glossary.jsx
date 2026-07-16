import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { Plus, Trash2 } from '@site/src/components/HP/icons';
import { useSyncedState, genId } from '@site/src/lib/useSyncedState';
import styles from './glossary.module.css';

const ACCENTS = ['var(--blå)', 'var(--orange)', 'var(--lila)', 'var(--svart)'];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Glossary() {
  const { value: cards, update, ready } = useSyncedState('glossary_cards', []);
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
    if (!window.confirm('Delete this card and all its words?')) return;
    update((prev) => prev.filter((c) => c.id !== id));
  }

  const sorted = [...cards].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <span className={styles.count}>{cards.length} cards</span>
        <button className={styles.btn} onClick={() => setShowForm((s) => !s)}>
          <Plus size={14} /> New card
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={addCard}>
          <div className={styles.formRow}>
            <input
              className={styles.control}
              placeholder="Title, e.g. Legal terms"
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
            <button type="submit" className={styles.btn}>Create</button>
            <button type="button" className={styles.btnGhost} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {cards.length === 0 && !showForm && (
        <div className={styles.empty}>No cards yet — create your first with “New card”.</div>
      )}

      <div className={styles.grid}>
        {sorted.map((c, i) => (
          <Link key={c.id} to={`/glossary/card?id=${c.id}`} className={styles.card}>
            <span className={styles.cardAccent} style={{ background: ACCENTS[i % ACCENTS.length] }} />
            <button
              className={styles.cardDelete}
              title="Delete card"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeCard(c.id); }}
            >
              <Trash2 size={14} />
            </button>
            <div className={styles.cardTitle}>{c.title}</div>
            <div className={styles.cardDate}>{c.date}</div>
            <div className={styles.cardCount}>{(c.words || []).length} words</div>
          </Link>
        ))}
        {cards.length > 0 && (
          <button className={styles.addTile} onClick={() => setShowForm(true)}>
            <Plus size={16} /> New card
          </button>
        )}
      </div>
    </div>
  );
}

