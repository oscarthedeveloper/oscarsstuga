import React, { useState } from 'react';
import { Plus, Trash2, Pencil, Check } from '@site/src/components/HP/icons';
import { useSyncedState, genId } from '@site/src/lib/useSyncedState';
import styles from './referenser.module.css';

const TYPES = [
  { id: 'studielitteratur', label: 'Studielitteratur' },
  { id: 'examensarbete', label: 'Examensarbeten' },
  { id: 'doktorsavhandling', label: 'Doktorsavhandlingar' },
];
const BLANK = { type: 'studielitteratur', title: '', author: '', year: '', url: '' };

export default function Referenser() {
  const { value: refs, update, ready, cloud } = useSyncedState('fornsvenska_refs', []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);

  if (!ready) return null;

  const list = (Array.isArray(refs) ? refs : []).filter((r) => r && r.id);

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const clean = {
      type: form.type,
      title: form.title.trim(),
      author: form.author.trim(),
      year: form.year.trim(),
      url: form.url.trim(),
    };
    if (editId) update((prev) => prev.map((r) => (r.id === editId ? { ...r, ...clean } : r)));
    else update((prev) => [...prev, { id: genId(), ...clean, createdAt: new Date().toISOString() }]);
    setForm(BLANK);
    setEditId(null);
    setShowForm(false);
  }
  function startEdit(r) {
    setEditId(r.id);
    setForm({ type: r.type || 'studielitteratur', title: r.title || '', author: r.author || '', year: r.year || '', url: r.url || '' });
    setShowForm(true);
  }
  function remove(id) {
    if (!window.confirm('Ta bort referensen?')) return;
    update((prev) => prev.filter((r) => r.id !== id));
  }

  function meta(r) {
    return [r.author, r.year].filter(Boolean).join(' · ');
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <span className={styles.count}>
          {list.length} referenser
          <span className={`${styles.cloudDot} ${cloud ? styles.cloudOn : styles.cloudOff}`} title={cloud ? 'Synkas till molnet' : 'Endast lokalt'} />
        </span>
        <button className={styles.btn} onClick={() => { setEditId(null); setForm(BLANK); setShowForm((s) => !s); }}>
          <Plus size={14} /> Ny referens
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.formGrid}>
            <select className={styles.control} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <input className={styles.control} placeholder="År" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} />
            <input className={`${styles.control} ${styles.wide}`} placeholder="Titel" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} autoFocus />
            <input className={`${styles.control} ${styles.wide}`} placeholder="Författare" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
            <input className={`${styles.control} ${styles.wide}`} placeholder="Länk (valfritt, https://…)" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btn}><Check size={14} /> {editId ? 'Spara' : 'Lägg till'}</button>
            <button type="button" className={styles.btnGhost} onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Avbryt</button>
          </div>
        </form>
      )}

      {list.length === 0 && !showForm && (
        <div className={styles.empty}>Inga referenser ännu — lägg till din första med “Ny referens”.</div>
      )}

      {TYPES.map((t) => {
        const inType = list
          .filter((r) => (r.type || 'studielitteratur') === t.id)
          .sort((a, b) => ((a.year || '') < (b.year || '') ? 1 : -1));
        if (inType.length === 0) return null;
        return (
          <section key={t.id} className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>{t.label}</span>
              <span className={styles.sectionCount}>{inType.length}</span>
            </div>
            <div className={styles.list}>
              {inType.map((r) => (
                <div key={r.id} className={styles.item}>
                  <div className={styles.itemMain}>
                    {r.url ? (
                      <a className={styles.refTitle} href={r.url} target="_blank" rel="noopener noreferrer">
                        {r.title} <span className={styles.ext} aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <span className={styles.refTitle}>{r.title}</span>
                    )}
                    {meta(r) && <span className={styles.refMeta}>{meta(r)}</span>}
                  </div>
                  <span className={styles.itemActions}>
                    <button className={styles.iconBtn} title="Redigera" onClick={() => startEdit(r)}><Pencil size={14} /></button>
                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Ta bort" onClick={() => remove(r.id)}><Trash2 size={14} /></button>
                  </span>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
