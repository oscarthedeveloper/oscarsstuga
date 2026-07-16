import React from 'react';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import { Plus, Trash2 } from '@site/src/components/HP/icons';
import { useSyncedState, genId } from '@site/src/lib/useSyncedState';
import styles from './notes.module.css';

function excerpt(n) {
  const src = n.html != null ? n.html.replace(/<[^>]+>/g, ' ') : (n.body || '');
  return src.replace(/&nbsp;/g, ' ').replace(/[#>*_`~-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);
}
function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString('sv-SE'); } catch { return ''; }
}

export default function NotesGrid({ langId, basePath = 'sprak' }) {
  const collection = `notes_${langId}`;
  const { value: notes, update, ready, cloud } = useSyncedState(collection, []);
  const history = useHistory();

  if (!ready) return null;

  function openEditor(id) {
    history.push(`/sprak-anteckning?base=${basePath}&lang=${langId}&id=${id}`);
  }
  function create() {
    const id = genId();
    const now = new Date().toISOString();
    update((prev) => [...prev, { id, title: 'Ny anteckning', html: '', createdAt: now, updatedAt: now }]);
    setTimeout(() => openEditor(id), 0);
  }
  function remove(id) {
    if (!window.confirm('Ta bort anteckningen?')) return;
    update((prev) => prev.filter((n) => n.id !== id));
  }

  const sorted = [...notes].sort((a, b) => ((a.updatedAt || a.createdAt) < (b.updatedAt || b.createdAt) ? 1 : -1));

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <span className={styles.count}>
          {notes.length} anteckningar
          <span className={`${styles.cloudDot} ${cloud ? styles.cloudOn : styles.cloudOff}`} title={cloud ? 'Synkas till molnet' : 'Endast lokalt'} />
        </span>
        <button className={styles.btn} onClick={create}><Plus size={14} /> Ny anteckning</button>
      </div>

      {notes.length === 0 ? (
        <div className={styles.empty}>Inga anteckningar ännu — skapa din första med “Ny anteckning”.</div>
      ) : (
        <div className={styles.grid}>
          {sorted.map((n) => (
            <Link key={n.id} to={`/sprak-anteckning?base=${basePath}&lang=${langId}&id=${n.id}`} className={styles.card}>
              <span className={styles.cardAccent} />
              <button
                className={styles.cardDelete}
                title="Ta bort"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(n.id); }}
              >
                <Trash2 size={14} />
              </button>
              <div className={styles.cardTitle}>{n.title || 'Utan titel'}</div>
              {excerpt(n) && <div className={styles.cardExcerpt}>{excerpt(n)}</div>}
              <div className={styles.cardDate}>{fmtDate(n.updatedAt || n.createdAt)}</div>
            </Link>
          ))}
          <button className={styles.addTile} onClick={create}><Plus size={16} /> Ny anteckning</button>
        </div>
      )}
    </div>
  );
}
