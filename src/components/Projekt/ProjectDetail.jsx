import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import { Plus, Trash2, Pencil, Check, X } from '@site/src/components/HP/icons';
import { useSyncedState, genId } from '@site/src/lib/useSyncedState';
import { TECH, STATUS, techColor, statusColor } from './config';
import styles from './projekt.module.css';

function parseRepo(url) {
  const m = (url || '').match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, '') };
}

function relTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'idag';
  if (days === 1) return 'igår';
  if (days < 30) return `${days} dagar sedan`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mån sedan`;
  return `${Math.floor(days / 365)} år sedan`;
}

function Badge({ label, color }) {
  return <span className={styles.badge} style={{ background: color + '22', color }}>{label}</span>;
}

export default function ProjectDetail({ projectId }) {
  const { value: projects, update, ready } = useSyncedState('projects', []);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [todoText, setTodoText] = useState('');
  const [notes, setNotes] = useState('');
  const [gh, setGh] = useState(null);
  const [ghErr, setGhErr] = useState(null);

  const project = projects.find((p) => p.id === projectId) || null;
  const repo = parseRepo(project?.repoUrl);

  // Synka anteckningsutkast när projektet laddas/ändras
  useEffect(() => { setNotes(project?.notes ?? ''); }, [projectId, project?.notes]);

  // Hämta GitHub-aktivitet
  useEffect(() => {
    setGh(null);
    setGhErr(null);
    if (!repo) return;
    let cancelled = false;
    fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status === 403 ? 'rate' : r.status)))
      .then((d) => { if (!cancelled) setGh(d); })
      .catch((e) => { if (!cancelled) setGhErr(String(e)); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo?.owner, repo?.repo]);

  if (!ready) return null;

  if (!project) {
    return (
      <div className={styles.wrap}>
        <Link className={styles.back} to="/mera/projekt/">← Tillbaka till Projekt</Link>
        <div className={styles.empty}>Projektet hittades inte. Det kan ha tagits bort, eller så laddas molndata fortfarande.</div>
      </div>
    );
  }

  function patch(p) {
    update((prev) => prev.map((x) => (x.id === projectId ? { ...x, ...p } : x)));
  }

  function startEdit() {
    setForm({
      name: project.name, tech: project.tech, status: project.status,
      description: project.description ?? '', liveUrl: project.liveUrl ?? '',
      repoUrl: project.repoUrl ?? '', host: project.host ?? '', lastDeploy: project.lastDeploy ?? '',
    });
    setEditing(true);
  }
  function saveEdit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    patch({ ...form, name: form.name.trim() });
    setEditing(false);
  }
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const todos = project.todos || [];
  function addTodo(e) {
    e.preventDefault();
    if (!todoText.trim()) return;
    patch({ todos: [...todos, { id: genId(), text: todoText.trim(), done: false }] });
    setTodoText('');
  }
  const toggleTodo = (id) => patch({ todos: todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });
  const removeTodo = (id) => patch({ todos: todos.filter((t) => t.id !== id) });
  const openTodos = todos.filter((t) => !t.done).length;

  return (
    <div className={styles.wrap}>
      <Link className={styles.back} to="/mera/projekt/">← Tillbaka till Projekt</Link>
      <h1>{project.name}</h1>
      <div className={styles.detailBadges}>
        <Badge label={project.tech} color={techColor(project.tech)} />
        <Badge label={project.status} color={statusColor(project.status)} />
      </div>

      {(project.liveUrl || project.repoUrl) && (
        <div style={{ marginBottom: '1.1rem' }}>
          {project.liveUrl && <a className={styles.linkBtn} href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live-sida ↗</a>}
          {project.repoUrl && <a className={styles.linkBtn} href={project.repoUrl} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
        </div>
      )}

      {/* Översikt / metadata */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>Översikt</span>
          {!editing && <button className={styles.iconBtn} title="Redigera" onClick={startEdit}><Pencil size={15} /></button>}
        </div>

        {editing ? (
          <form className={styles.formGrid} onSubmit={saveEdit}>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <span className={styles.label}>Namn</span>
              <input className={styles.control} value={form.name} onChange={(e) => setF('name', e.target.value)} />
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Teknik</span>
              <select className={styles.control} value={form.tech} onChange={(e) => setF('tech', e.target.value)}>
                {TECH.map((t) => <option key={t.id} value={t.id}>{t.id}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Status</span>
              <select className={styles.control} value={form.status} onChange={(e) => setF('status', e.target.value)}>
                {STATUS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Live-URL</span>
              <input className={styles.control} value={form.liveUrl} onChange={(e) => setF('liveUrl', e.target.value)} placeholder="https://…" />
            </div>
            <div className={styles.field}>
              <span className={styles.label}>GitHub-repo</span>
              <input className={styles.control} value={form.repoUrl} onChange={(e) => setF('repoUrl', e.target.value)} placeholder="https://github.com/…" />
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Host</span>
              <input className={styles.control} value={form.host} onChange={(e) => setF('host', e.target.value)} placeholder="Vercel / Netlify / GitHub Pages…" />
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Senaste deploy</span>
              <input className={styles.control} type="date" value={form.lastDeploy} onChange={(e) => setF('lastDeploy', e.target.value)} />
            </div>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <span className={styles.label}>Beskrivning</span>
              <textarea className={`${styles.control} ${styles.textarea}`} value={form.description} onChange={(e) => setF('description', e.target.value)} />
            </div>
            <div className={`${styles.formActions} ${styles.fieldWide}`}>
              <button type="submit" className={styles.btn}><Check size={14} /> Spara</button>
              <button type="button" className={styles.btnGhost} onClick={() => setEditing(false)}>Avbryt</button>
            </div>
          </form>
        ) : (
          <div className={styles.metaGrid}>
            {project.description && (
              <div className={`${styles.metaItem} ${styles.fieldWide}`}>
                <span className={styles.metaLabel}>Beskrivning</span>
                <span className={styles.metaValue}>{project.description}</span>
              </div>
            )}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Host</span>
              <span className={styles.metaValue}>{project.host || '—'}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Senaste deploy</span>
              <span className={styles.metaValue}>{project.lastDeploy || '—'}</span>
            </div>
          </div>
        )}
      </div>

      {/* GitHub-aktivitet */}
      {project.repoUrl && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>GitHub-aktivitet</span>
          </div>
          {gh ? (
            <div className={styles.ghStats}>
              <div className={styles.ghStat}>
                <span className={styles.ghNum}>{relTime(gh.pushed_at)}</span>
                <span className={styles.ghLabel}>senaste push</span>
              </div>
              <div className={styles.ghStat}>
                <span className={styles.ghNum}>{gh.open_issues_count ?? 0}</span>
                <span className={styles.ghLabel}>öppna issues/PR</span>
              </div>
              <div className={styles.ghStat}>
                <span className={styles.ghNum}>{gh.stargazers_count ?? 0}</span>
                <span className={styles.ghLabel}>stjärnor</span>
              </div>
            </div>
          ) : ghErr ? (
            <p className={styles.ghMuted}>
              {ghErr === 'rate' ? 'GitHubs API-gräns nådd (~60/timme) — försök igen senare.' : 'Kunde inte hämta repo-data (kontrollera att repot är publikt och att länken stämmer).'}
            </p>
          ) : repo ? (
            <p className={styles.ghMuted}>Hämtar…</p>
          ) : (
            <p className={styles.ghMuted}>Ogiltig GitHub-länk.</p>
          )}
        </div>
      )}

      {/* Att göra */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>Att göra</span>
          <span className={styles.ghLabel}>{openTodos} kvar</span>
        </div>
        {todos.map((t) => (
          <div key={t.id} className={styles.todoRow}>
            <button className={`${styles.checkbox} ${t.done ? styles.checkboxOn : ''}`} onClick={() => toggleTodo(t.id)} title={t.done ? 'Markera som ej klar' : 'Markera som klar'}>
              {t.done && <Check size={12} strokeWidth={3} />}
            </button>
            <span className={`${styles.todoText} ${t.done ? styles.todoDone : ''}`}>{t.text}</span>
            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => removeTodo(t.id)} title="Ta bort"><Trash2 size={13} /></button>
          </div>
        ))}
        <form className={styles.addRow} onSubmit={addTodo}>
          <input className={styles.control} value={todoText} onChange={(e) => setTodoText(e.target.value)} placeholder="Ny uppgift…" />
          <button type="submit" className={styles.btn}><Plus size={14} /></button>
        </form>
      </div>

      {/* Anteckningar */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>Anteckningar</span>
        </div>
        <textarea
          className={`${styles.control} ${styles.textarea}`}
          style={{ minHeight: '110px' }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => { if (notes !== (project.notes ?? '')) patch({ notes }); }}
          placeholder="Idéer, buggar, nästa steg…"
        />
      </div>
    </div>
  );
}
