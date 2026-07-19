import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { Plus, Trash2, Pencil, Check } from '@site/src/components/HP/icons';
import { useSyncedState, genId } from '@site/src/lib/useSyncedState';
import styles from './bocker.module.css';

const STATUSES = [
  { id: 'reading', label: 'Läser', color: 'var(--blå)' },
  { id: 'toread', label: 'Skall läsa', color: 'var(--lila)' },
  { id: 'read', label: 'Läst', color: '#2ea043' },
];
const BLANK = { title: '', author: '', status: 'reading' };

export default function Books() {
  const { value: books, update, ready, cloud } = useSyncedState('mera_books', []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);

  if (!ready) return null;

  const list = (Array.isArray(books) ? books : []).filter((b) => b && b.id);

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const clean = { title: form.title.trim(), author: form.author.trim(), status: form.status };
    if (editId) update((prev) => prev.map((b) => (b.id === editId ? { ...b, ...clean } : b)));
    else update((prev) => [...prev, { id: genId(), ...clean, createdAt: new Date().toISOString() }]);
    setForm(BLANK);
    setEditId(null);
    setShowForm(false);
  }
  function startEdit(b) {
    setEditId(b.id);
    setForm({ title: b.title, author: b.author || '', status: b.status || 'reading' });
    setShowForm(true);
  }
  function remove(id) {
    if (!window.confirm('Ta bort boken?')) return;
    update((prev) => prev.filter((b) => b.id !== id));
  }
  function setStatus(id, status) {
    update((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <span className={styles.count}>
          {list.length} böcker
          <span className={`${styles.cloudDot} ${cloud ? styles.cloudOn : styles.cloudOff}`} title={cloud ? 'Synkas till molnet' : 'Endast lokalt'} />
        </span>
        <button className={styles.btn} onClick={() => { setEditId(null); setForm(BLANK); setShowForm((s) => !s); }}>
          <Plus size={14} /> Ny bok
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.formGrid}>
            <input className={styles.control} placeholder="Titel" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} autoFocus />
            <input className={styles.control} placeholder="Författare" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
            <select className={styles.control} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btn}><Check size={14} /> {editId ? 'Spara' : 'Lägg till'}</button>
            <button type="button" className={styles.btnGhost} onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Avbryt</button>
          </div>
        </form>
      )}

      {STATUSES.map((s) => {
        const inSection = list
          .filter((b) => (b.status || 'reading') === s.id)
          .sort((a, b) => ((a.createdAt || '') < (b.createdAt || '') ? 1 : -1));
        return (
          <section key={s.id} className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionDot} style={{ background: s.color }} />
              <span className={styles.sectionTitle}>{s.label}</span>
              <span className={styles.sectionCount}>{inSection.length}</span>
            </div>
            {inSection.length === 0 ? (
              <div className={styles.emptyRow}>Inga böcker här ännu.</div>
            ) : (
              <div className={styles.grid}>
                {inSection.map((b) => (
                  <div key={b.id} className={styles.card}>
                    <span className={styles.cardAccent} style={{ background: s.color }} />
                    <Link className={styles.cardTitle} to={`/bok?id=${b.id}`}>{b.title}</Link>
                    {b.author && <div className={styles.cardAuthor}>{b.author}</div>}
                    <div className={styles.cardFooter}>
                      <select className={styles.moveSelect} value={b.status || 'reading'} onChange={(e) => setStatus(b.id, e.target.value)} title="Flytta bok">
                        {STATUSES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                      </select>
                      <span className={styles.cardActions}>
                        <button className={styles.iconBtn} title="Redigera" onClick={() => startEdit(b)}><Pencil size={14} /></button>
                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Ta bort" onClick={() => remove(b.id)}><Trash2 size={14} /></button>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
