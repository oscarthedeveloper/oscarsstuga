import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { Plus, Trash2, Pencil, Check } from '@site/src/components/HP/icons';
import { useSyncedState, genId } from '@site/src/lib/useSyncedState';
import styles from './bocker.module.css';

function EntrySection({ label, addLabel, entries, fields, patch }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);

  function blank() { const o = {}; fields.forEach((f) => (o[f.key] = '')); return o; }
  function toggle() { setEditId(null); setForm(blank()); setShowForm((s) => !s); }
  function submit(e) {
    e.preventDefault();
    if (!(form[fields[0].key] || '').trim()) return;
    const clean = {};
    fields.forEach((f) => (clean[f.key] = (form[f.key] || '').trim()));
    if (editId) patch(entries.map((x) => (x.id === editId ? { ...x, ...clean } : x)));
    else patch([...entries, { id: genId(), ...clean }]);
    setForm(blank());
    setEditId(null);
    setShowForm(false);
  }
  function startEdit(x) { setEditId(x.id); setForm({ ...x }); setShowForm(true); }
  function remove(id) { patch(entries.filter((x) => x.id !== id)); }

  return (
    <section className={styles.detailSection}>
      <div className={styles.detailSectionHead}>
        <span className={styles.detailSectionTitle}>{label}</span>
        <span className={styles.detailSectionCount}>{entries.length}</span>
        <button className={styles.btnGhost} onClick={toggle}><Plus size={13} /> {addLabel}</button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={submit}>
          {fields.map((f, i) => (
            f.multiline ? (
              <textarea
                key={f.key}
                className={`${styles.control} ${styles.textarea}`}
                style={i > 0 ? { marginTop: '0.6rem' } : undefined}
                placeholder={f.placeholder}
                value={form[f.key] || ''}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                autoFocus={i === 0}
              />
            ) : (
              <input
                key={f.key}
                className={styles.control}
                style={i > 0 ? { marginTop: '0.6rem' } : undefined}
                placeholder={f.placeholder}
                value={form[f.key] || ''}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                autoFocus={i === 0}
              />
            )
          ))}
          <div className={styles.formActions}>
            <button type="submit" className={styles.btn}><Check size={14} /> {editId ? 'Spara' : 'Lägg till'}</button>
            <button type="button" className={styles.btnGhost} onClick={() => { setShowForm(false); setEditId(null); setForm(blank()); }}>Avbryt</button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <div className={styles.emptyRow}>Inget sparat ännu.</div>
      ) : (
        <div className={styles.entryList}>
          {entries.map((x) => (
            <div key={x.id} className={styles.entryRow}>
              <div className={styles.entryMain}>
                <div className={styles.entryPrimary}>{x[fields[0].key]}</div>
                {fields.slice(1).map((f) => (x[f.key] ? <div key={f.key} className={styles.entrySecondary}>{x[f.key]}</div> : null))}
              </div>
              <span className={styles.entryActions}>
                <button className={styles.iconBtn} title="Redigera" onClick={() => startEdit(x)}><Pencil size={14} /></button>
                <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Ta bort" onClick={() => remove(x.id)}><Trash2 size={14} /></button>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function BookDetail({ bookId }) {
  const { value: books, update, ready } = useSyncedState('mera_books', []);
  if (!ready) return null;

  const book = (Array.isArray(books) ? books : []).find((b) => b && b.id === bookId);
  if (!book) {
    return (
      <div className={styles.wrap}>
        <Link className={styles.back} to="/mera/bocker">← Tillbaka till Böcker</Link>
        <div className={styles.emptyRow}>Boken hittades inte. Den kan ha tagits bort, eller så laddas molndata fortfarande.</div>
      </div>
    );
  }

  const words = book.words || [];
  const idioms = book.idioms || [];
  const quotes = book.quotes || [];

  function patchBook(patch) {
    update((prev) => prev.map((b) => (b.id === bookId ? { ...b, ...patch } : b)));
  }

  return (
    <div className={styles.wrap}>
      <Link className={styles.back} to="/mera/bocker">← Tillbaka till Böcker</Link>
      <h1>{book.title}</h1>
      {book.author && <p className={styles.detailAuthor}>{book.author}</p>}

      <EntrySection
        label="Ord"
        addLabel="Nytt ord"
        entries={words}
        patch={(v) => patchBook({ words: v })}
        fields={[{ key: 'term', placeholder: 'Ord' }, { key: 'meaning', placeholder: 'Betydelse' }]}
      />
      <EntrySection
        label="Idiomatiska uttryck"
        addLabel="Nytt uttryck"
        entries={idioms}
        patch={(v) => patchBook({ idioms: v })}
        fields={[{ key: 'expression', placeholder: 'Uttryck' }, { key: 'meaning', placeholder: 'Betydelse' }]}
      />
      <EntrySection
        label="Citat & tankar"
        addLabel="Nytt citat"
        entries={quotes}
        patch={(v) => patchBook({ quotes: v })}
        fields={[{ key: 'quote', placeholder: 'Citat', multiline: true }, { key: 'thought', placeholder: 'Tanke', multiline: true }]}
      />
    </div>
  );
}
