import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { Plus, Trash2 } from '@site/src/components/HP/icons';
import { useSyncedState, genId } from '@site/src/lib/useSyncedState';
import { TECH, STATUS, techColor, statusColor } from './config';
import styles from './projekt.module.css';

const BLANK = { name: '', tech: 'React', status: 'Pågår', description: '', liveUrl: '', repoUrl: '' };

function Badge({ label, color }) {
  return (
    <span className={styles.badge} style={{ background: color + '22', color }}>
      {label}
    </span>
  );
}

export default function Projects() {
  const { value: projects, update, ready } = useSyncedState('projects', []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [filter, setFilter] = useState('Alla');

  if (!ready) return null;

  function addProject(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const p = {
      id: genId(),
      name: form.name.trim(),
      tech: form.tech,
      status: form.status,
      description: form.description.trim(),
      liveUrl: form.liveUrl.trim(),
      repoUrl: form.repoUrl.trim(),
      host: '',
      lastDeploy: '',
      notes: '',
      todos: [],
      createdAt: new Date().toISOString(),
    };
    update((prev) => [...prev, p]);
    setForm(BLANK);
    setShowForm(false);
  }

  function removeProject(id) {
    if (!window.confirm('Ta bort projektet?')) return;
    update((prev) => prev.filter((p) => p.id !== id));
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const shown = filter === 'Alla' ? projects : projects.filter((p) => p.status === filter);
  const sorted = [...shown].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <span className={styles.count}>{projects.length} projekt</span>
        <button className={styles.btn} onClick={() => setShowForm((s) => !s)}>
          <Plus size={14} /> Nytt projekt
        </button>
      </div>

      <div className={styles.filterRow}>
        <span className={styles.filterLabel}>Status</span>
        {['Alla', ...STATUS.map((s) => s.id)].map((s) => (
          <button
            key={s}
            className={`${styles.chip} ${filter === s ? styles.chipActive : ''}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={addProject}>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <span className={styles.label}>Namn</span>
              <input className={styles.control} value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus placeholder="t.ex. Oscars Stuga" />
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Teknik</span>
              <select className={styles.control} value={form.tech} onChange={(e) => set('tech', e.target.value)}>
                {TECH.map((t) => <option key={t.id} value={t.id}>{t.id}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Status</span>
              <select className={styles.control} value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Live-URL</span>
              <input className={styles.control} value={form.liveUrl} onChange={(e) => set('liveUrl', e.target.value)} placeholder="https://…" />
            </div>
            <div className={styles.field}>
              <span className={styles.label}>GitHub-repo</span>
              <input className={styles.control} value={form.repoUrl} onChange={(e) => set('repoUrl', e.target.value)} placeholder="https://github.com/…" />
            </div>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <span className={styles.label}>Beskrivning</span>
              <textarea className={`${styles.control} ${styles.textarea}`} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Kort om projektet" />
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btn}>Skapa</button>
            <button type="button" className={styles.btnGhost} onClick={() => setShowForm(false)}>Avbryt</button>
          </div>
        </form>
      )}

      {shown.length === 0 && !showForm && (
        <div className={styles.empty}>
          {projects.length === 0 ? 'Inga projekt ännu — skapa ditt första med “Nytt projekt”.' : 'Inga projekt med denna status.'}
        </div>
      )}

      <div className={styles.grid}>
        {sorted.map((p) => (
          <Link key={p.id} to={`/projekt-detalj?id=${p.id}`} className={styles.card}>
            <span className={styles.cardAccent} style={{ background: techColor(p.tech) }} />
            <button
              className={styles.cardDelete}
              title="Ta bort projekt"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeProject(p.id); }}
            >
              <Trash2 size={14} />
            </button>
            <div className={styles.cardName}>{p.name}</div>
            {p.description && <div className={styles.cardDesc}>{p.description}</div>}
            <div className={styles.badges}>
              <Badge label={p.tech} color={techColor(p.tech)} />
              <Badge label={p.status} color={statusColor(p.status)} />
            </div>
          </Link>
        ))}
        {projects.length > 0 && (
          <button className={styles.addTile} onClick={() => setShowForm(true)}>
            <Plus size={16} /> Nytt projekt
          </button>
        )}
      </div>
    </div>
  );
}
