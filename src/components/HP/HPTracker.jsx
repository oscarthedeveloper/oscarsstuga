import React, { useState, useMemo } from 'react';
import { Plus, Calendar, Trash2, Pencil, X, Check } from './icons';
import { useHPData } from './useHPData';
import styles from './hp.module.css';

// ─── Sektionskonfiguration ────────────────────────────────────────────────────

const VERBAL = [
  { id: 'ORD', label: 'Ordförståelse', color: '#7c72f5', max: 20 },
  { id: 'LÄS', label: 'Läsförståelse', color: '#22d3ee', max: 20 },
  { id: 'MEK', label: 'Meningskomplettering', color: '#fb923c', max: 20 },
  { id: 'ELF', label: 'Engelsk läsförståelse', color: '#34d399', max: 20 },
];

const KVANTITATIVT = [
  { id: 'XYZ', label: 'Matematisk problemlösning', color: '#fbbf24', max: 20 },
  { id: 'KVA', label: 'Kvantitativa jämförelser', color: '#e11d48', max: 20 },
  { id: 'NOG', label: 'Datatolkning', color: '#a78bfa', max: 12 },
  { id: 'DTK', label: 'Diagram, tabeller & kartor', color: '#38bdf8', max: 20 },
];

const ALL_SECTIONS = [...VERBAL, ...KVANTITATIVT];

function sectionById(id) {
  return ALL_SECTIONS.find((s) => s.id === id) ?? { id, label: id, color: '#8080a0', max: 20 };
}

// ─── Hjälpfunktioner ──────────────────────────────────────────────────────────

function pct(score, max) {
  if (!score || !max) return null;
  return Math.round((Number(score) / Number(max)) * 100);
}
function avgPct(sessions) {
  const valid = sessions.filter((s) => s.score && s.maxScore);
  if (!valid.length) return null;
  return Math.round(valid.reduce((a, s) => a + (s.score / s.maxScore) * 100, 0) / valid.length);
}
function bestPct(sessions) {
  const valid = sessions.filter((s) => s.score && s.maxScore);
  if (!valid.length) return null;
  return Math.round(Math.max(...valid.map((s) => (s.score / s.maxScore) * 100)));
}

const FORM_YEARS = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - i);

// ─── Huvudkomponent ───────────────────────────────────────────────────────────

export default function HPTracker() {
  const {
    ready, cloud, examDate, sessions, hpExams,
    setExamDate, addSession, updateSession, removeSession,
    addHpExam, toggleHpExamSection, removeHpExam, daysUntilExam,
  } = useHPData();

  const [tab, setTab] = useState('logg');
  const [showForm, setShowForm] = useState(false);
  const [filterSec, setFilterSec] = useState('all');
  const [confirmDel, setConfirmDel] = useState(null);
  const [editId, setEditId] = useState(null);

  const BLANK_FORM = {
    section: 'ORD',
    year: new Date().getFullYear(),
    season: 'Höst',
    part: 1,
    date: new Date().toISOString().slice(0, 10),
    score: '',
    maxScore: '',
    notes: '',
  };

  const [form, setForm] = useState(BLANK_FORM);
  const [editForm, setEditForm] = useState(null);

  const days = daysUntilExam();

  const filtered = useMemo(() => {
    const base = [...sessions].sort(
      (a, b) => new Date(b.date ?? b.createdAt) - new Date(a.date ?? a.createdAt)
    );
    return filterSec === 'all' ? base : base.filter((s) => s.section === filterSec);
  }, [sessions, filterSec]);

  function handleAdd(e) {
    e.preventDefault();
    addSession({
      ...form,
      score: form.score ? Number(form.score) : null,
      maxScore: form.maxScore ? Number(form.maxScore) : null,
      part: Number(form.part),
    });
    setForm(BLANK_FORM);
    setShowForm(false);
  }

  function startEdit(s) {
    setEditId(s.id);
    setEditForm({
      section: s.section,
      year: s.year ?? new Date().getFullYear(),
      season: s.season ?? 'Höst',
      part: s.part ?? 1,
      date: s.date ?? s.createdAt?.slice(0, 10) ?? '',
      score: s.score != null ? String(s.score) : '',
      maxScore: s.maxScore != null ? String(s.maxScore) : '',
      notes: s.notes ?? '',
    });
  }

  function handleUpdate(e) {
    e.preventDefault();
    updateSession(editId, {
      ...editForm,
      score: editForm.score ? Number(editForm.score) : null,
      maxScore: editForm.maxScore ? Number(editForm.maxScore) : null,
      part: Number(editForm.part),
    });
    addHpExam(Number(editForm.year), editForm.season);
    setEditId(null);
    setEditForm(null);
  }

  if (!ready) return null;

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Högskoleprov</h1>
        <p className={styles.subtitle}>
          {sessions.length} sessioner loggade · {ALL_SECTIONS.length} delprov
          <span
            className={`${styles.cloudDot} ${cloud ? styles.cloudOn : styles.cloudOff}`}
            title={cloud ? 'Synkas till Supabase' : 'Endast lokalt (localStorage)'}
          />
        </p>
      </div>

      {/* Countdown */}
      <div className={styles.countdown}>
        <div className={styles.countRow}>
          <div>
            {days !== null ? (
              <>
                <span className={styles.countNum}>{days}</span>
                <span className={styles.countLabel}>dagar till provdag</span>
              </>
            ) : (
              <span className={styles.countLabel}>Ange provdatum →</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={14} />
            <input
              type="date"
              className={styles.dateInput}
              value={examDate ?? ''}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
        </div>
        {days !== null && (
          <>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{ width: `${Math.max(2, 100 - (days / 365) * 100)}%` }}
              />
            </div>
            <div className={styles.progressEnds}>
              <span>idag</span>
              <span>{examDate ? new Date(examDate).toLocaleDateString('sv-SE') : ''}</span>
            </div>
          </>
        )}
      </div>

      {/* Flikar */}
      <div className={styles.tabs}>
        {[['logg', 'Sessionslogg'], ['prov', 'Provöversikt']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'prov' && (
        <ExamGrid
          hpExams={hpExams}
          sessions={sessions}
          onAdd={addHpExam}
          onToggle={toggleHpExamSection}
          onRemove={removeHpExam}
        />
      )}

      {tab === 'logg' && (
        <>
          {/* Sektionsöversikt */}
          <div>
            <p className={styles.groupLabel}>Verbalt</p>
            <div className={styles.sectionGrid}>
              {VERBAL.map((sec) => (
                <SectionCard
                  key={sec.id}
                  sec={sec}
                  sessions={sessions.filter((s) => s.section === sec.id)}
                  onClick={() => setFilterSec(filterSec === sec.id ? 'all' : sec.id)}
                  active={filterSec === sec.id}
                />
              ))}
            </div>
            <p className={styles.groupLabel}>Kvantitativt</p>
            <div className={styles.sectionGrid}>
              {KVANTITATIVT.map((sec) => (
                <SectionCard
                  key={sec.id}
                  sec={sec}
                  sessions={sessions.filter((s) => s.section === sec.id)}
                  onClick={() => setFilterSec(filterSec === sec.id ? 'all' : sec.id)}
                  active={filterSec === sec.id}
                />
              ))}
            </div>
          </div>

          {/* Logg-verktygsrad */}
          <div className={styles.logBar}>
            <div className={styles.chips}>
              <button
                onClick={() => setFilterSec('all')}
                className={`${styles.chip} ${filterSec === 'all' ? styles.chipActive : ''}`}
              >
                alla
              </button>
              {ALL_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setFilterSec(filterSec === sec.id ? 'all' : sec.id)}
                  className={`${styles.chip} ${filterSec === sec.id ? styles.chipActive : ''}`}
                  style={
                    filterSec === sec.id
                      ? { backgroundColor: sec.color + '22', color: sec.color, borderColor: sec.color + '55' }
                      : {}
                  }
                >
                  {sec.id}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={styles.secCount}>{filtered.length} sessioner</span>
              <button onClick={() => setShowForm((s) => !s)} className={styles.btnPrimary}>
                <Plus size={13} /> Ny session
              </button>
            </div>
          </div>

          {/* Formulär */}
          {showForm && (
            <form onSubmit={handleAdd} className={styles.form}>
              <div className={styles.formHead}>
                <span className={styles.formTitle}>Ny session</span>
                <button type="button" onClick={() => setShowForm(false)} className={styles.iconBtn}>
                  <X size={15} />
                </button>
              </div>
              <SessionFormFields form={form} setForm={setForm} />
              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary}>Logga</button>
                <button type="button" onClick={() => setShowForm(false)} className={styles.btnGhost}>Avbryt</button>
              </div>
            </form>
          )}

          {/* Sessionslista */}
          <div className={styles.list}>
            {filtered.map((s) => {
              const sec = sectionById(s.section);
              const p = pct(s.score, s.maxScore);

              if (editId === s.id) {
                return (
                  <form key={s.id} onSubmit={handleUpdate} className={styles.form}>
                    <div className={styles.formHead}>
                      <span className={styles.formTitle} style={{ color: sec.color }}>{sec.id}</span>
                      <button type="button" onClick={() => setEditId(null)} className={styles.iconBtn}>
                        <X size={14} />
                      </button>
                    </div>
                    <SessionFormFields form={editForm} setForm={setEditForm} />
                    <div className={styles.formActions}>
                      <button type="submit" className={styles.btnPrimary}><Check size={13} /> Spara</button>
                      <button type="button" onClick={() => setEditId(null)} className={styles.btnGhost}>Avbryt</button>
                    </div>
                  </form>
                );
              }

              return (
                <SessionRow
                  key={s.id}
                  session={s}
                  sec={sec}
                  pctValue={p}
                  onEdit={() => startEdit(s)}
                  onDelete={() => setConfirmDel(s.id)}
                />
              );
            })}

            {filtered.length === 0 && (
              <div className={styles.empty}>
                {sessions.length === 0
                  ? 'Inga sessioner ännu — logga din första'
                  : 'Inga sessioner för detta delprov'}
              </div>
            )}
          </div>

          {/* Radera-bekräftelse */}
          {confirmDel && (
            <div className={styles.overlay}>
              <div className={styles.modal}>
                <p className={styles.modalText}>Ta bort sessionen?</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => { removeSession(confirmDel); setConfirmDel(null); }}
                    className={styles.dangerBtn}
                  >
                    Ta bort
                  </button>
                  <button onClick={() => setConfirmDel(null)} className={styles.btnGhost}>Avbryt</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────

function SectionCard({ sec, sessions, onClick, active }) {
  const avg = avgPct(sessions);
  const best = bestPct(sessions);
  const last = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const lastPct = last ? pct(last.score, last.maxScore) : null;
  const spark = sessions.slice(-5).map((s) => pct(s.score, s.maxScore)).filter((v) => v !== null);

  return (
    <button
      onClick={onClick}
      className={`${styles.sectionCard} ${active ? styles.sectionCardActive : ''}`}
    >
      <div className={styles.accentBar} style={{ backgroundColor: sec.color }} />
      <div className={styles.secTop}>
        <div>
          <div className={styles.secId} style={{ color: sec.color }}>{sec.id}</div>
          <div className={styles.secName}>{sec.label}</div>
        </div>
        <span className={styles.secCount}>{sessions.length}×</span>
      </div>

      {avg !== null ? (
        <>
          <div>
            <span className={styles.secBig}>{avg}</span>
            <span className={styles.secUnit}>% snitt</span>
          </div>
          <div className={styles.secMeta}>
            <span>bäst <span style={{ color: sec.color }}>{best}%</span></span>
            {lastPct !== null && <span>senast {lastPct}%</span>}
          </div>
          {spark.length > 1 && (
            <div className={styles.spark}>
              {spark.map((v, i) => (
                <div
                  key={i}
                  className={styles.sparkBar}
                  style={{ height: `${v}%`, backgroundColor: sec.color + (i === spark.length - 1 ? 'ee' : '66') }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className={styles.secEmpty}>ingen data</p>
      )}
    </button>
  );
}

// ─── SessionRow ───────────────────────────────────────────────────────────────

function SessionRow({ session, sec, pctValue: p, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = session.date
    ? new Date(session.date).toLocaleDateString('sv-SE')
    : session.createdAt
      ? new Date(session.createdAt).toLocaleDateString('sv-SE')
      : '—';

  return (
    <div className={styles.row}>
      <div className={styles.rowMain} onClick={() => setExpanded((s) => !s)}>
        <span
          className={styles.badge}
          style={{ backgroundColor: sec.color + '22', color: sec.color }}
        >
          {session.section}
        </span>
        <span className={styles.score}>
          {session.score ?? '—'}/{session.maxScore ?? '—'}
          {p !== null && (
            <span
              className={styles.scorePct}
              style={{ color: p >= 75 ? '#059669' : p >= 50 ? '#d97706' : '#e11d48' }}
            >
              {p}%
            </span>
          )}
        </span>
        {p !== null && (
          <div className={styles.rowTrack}>
            <div className={styles.rowBar} style={{ width: `${p}%`, backgroundColor: sec.color }} />
          </div>
        )}
        <div className={styles.rowMeta}>
          {session.year && (
            <span>
              {session.year} {session.season}
              {session.part ? ` · Delprov ${session.part}` : ''}
            </span>
          )}
          <span>{dateStr}</span>
        </div>
        <div className={styles.rowActions} onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className={styles.iconBtn}><Pencil size={13} /></button>
          <button onClick={onDelete} className={`${styles.iconBtn} ${styles.iconBtnDanger}`}><Trash2 size={13} /></button>
        </div>
      </div>
      {expanded && session.notes && <div className={styles.rowNotes}>{session.notes}</div>}
    </div>
  );
}

// ─── SessionFormFields ────────────────────────────────────────────────────────

function SessionFormFields({ form, setForm }) {
  return (
    <div className={styles.formGrid}>
      <div className={styles.field}>
        <label>Delprov</label>
        <select
          className={styles.control}
          value={form.section}
          onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
        >
          <optgroup label="Verbalt">
            {VERBAL.map((s) => <option key={s.id} value={s.id}>{s.id} — {s.label}</option>)}
          </optgroup>
          <optgroup label="Kvantitativt">
            {KVANTITATIVT.map((s) => <option key={s.id} value={s.id}>{s.id} — {s.label}</option>)}
          </optgroup>
        </select>
      </div>

      <div className={styles.field}>
        <label>År</label>
        <select
          className={styles.control}
          value={form.year}
          onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
        >
          {FORM_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className={styles.field}>
        <label>Termin</label>
        <select
          className={styles.control}
          value={form.season}
          onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))}
        >
          <option value="Vår">Vår</option>
          <option value="Höst">Höst</option>
        </select>
      </div>

      <div className={styles.field}>
        <label>Delprovsnummer</label>
        <select
          className={styles.control}
          value={form.part}
          onChange={(e) => setForm((f) => ({ ...f, part: Number(e.target.value) }))}
        >
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Delprov {n}</option>)}
        </select>
      </div>

      <Field label="Poäng" value={form.score} onChange={(v) => setForm((f) => ({ ...f, score: v }))} type="number" placeholder="0" />
      <Field label="Max poäng" value={form.maxScore} onChange={(v) => setForm((f) => ({ ...f, maxScore: v }))} type="number" placeholder="20" />

      <div className={`${styles.field} ${styles.fieldWide}`}>
        <label>Anteckningar</label>
        <input
          className={styles.control}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Vad gick bra / mindre bra?"
        />
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <input
        type={type}
        className={styles.control}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// ─── ExamGrid ─────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);
const SEASONS = ['Vår', 'Höst'];

function ExamGrid({ hpExams, sessions, onAdd, onToggle, onRemove }) {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [season, setSeason] = useState('Höst');
  const [confirmDel, setConfirmDel] = useState(null);

  const sorted = [...hpExams].sort((a, b) =>
    b.year !== a.year ? b.year - a.year : a.season === 'Höst' ? -1 : 1
  );
  const totalSections = ALL_SECTIONS.length;

  return (
    <div>
      <div className={styles.addExamRow}>
        <div className={styles.field}>
          <label>År</label>
          <select className={styles.control} value={year} onChange={(e) => setYear(e.target.value)}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label>Termin</label>
          <select className={styles.control} value={season} onChange={(e) => setSeason(e.target.value)}>
            {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={() => onAdd(Number(year), season)} className={styles.btnPrimary}>
          <Plus size={13} /> Lägg till prov
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className={styles.empty}>Lägg till ett HP-tillfälle ovan</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <colgroup>
              <col style={{ width: '13%' }} />
              {VERBAL.map((s, i) => <col key={`cv${i}`} />)}
              <col style={{ width: '2px' }} />
              {KVANTITATIVT.map((s, i) => <col key={`ck${i}`} />)}
              <col style={{ width: '58px' }} />
              <col style={{ width: '44px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className={styles.thLabel}>Tillfälle</th>
                {VERBAL.map((sec) => (
                  <th key={sec.id} className={styles.thSec}>
                    <span className={styles.thSecId} style={{ color: sec.color }}>{sec.id}</span>
                    <span className={styles.thSecName}>{sec.label.split(' ')[0]}</span>
                  </th>
                ))}
                <th className={styles.sep} />
                {KVANTITATIVT.map((sec) => (
                  <th key={sec.id} className={styles.thSec}>
                    <span className={styles.thSecId} style={{ color: sec.color }}>{sec.id}</span>
                    <span className={styles.thSecName}>{sec.label.split(' ')[0]}</span>
                  </th>
                ))}
                <th className={styles.thSec}><span className={styles.thLabel}>%</span></th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((exam) => {
                function sectionStatus(secId) {
                  const fromSession = sessions.some(
                    (s) => Number(s.year) === Number(exam.year) && s.season === exam.season && s.section === secId
                  );
                  const manual = exam.completed?.includes(secId) ?? false;
                  return { done: fromSession || manual, fromSession };
                }
                const doneCount = ALL_SECTIONS.filter((s) => sectionStatus(s.id).done).length;
                const p = Math.round((doneCount / totalSections) * 100);

                return (
                  <tr key={exam.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{exam.year}</div>
                      <div className={styles.secName}>{exam.season}</div>
                    </td>
                    {VERBAL.map((sec) => {
                      const { done, fromSession } = sectionStatus(sec.id);
                      return <ExamCell key={sec.id} done={done} fromSession={fromSession} color={sec.color} onClick={() => onToggle(exam.id, sec.id)} />;
                    })}
                    <td className={styles.sep} />
                    {KVANTITATIVT.map((sec) => {
                      const { done, fromSession } = sectionStatus(sec.id);
                      return <ExamCell key={sec.id} done={done} fromSession={fromSession} color={sec.color} onClick={() => onToggle(exam.id, sec.id)} />;
                    })}
                    <td className={styles.thSec}>
                      <div style={{ fontSize: '0.72rem', color: p === 100 ? '#059669' : p >= 50 ? '#d97706' : 'var(--ifm-color-emphasis-600)' }}>
                        {doneCount}/{totalSections}
                      </div>
                    </td>
                    <td>
                      <button onClick={() => setConfirmDel(exam.id)} className={`${styles.iconBtn} ${styles.iconBtnDanger}`}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className={styles.legend}>
            <span>Förklaring:</span>
            <span className={styles.legendSwatch}>
              <span className={styles.cellBtn} style={{ height: 14, width: 14 }} /> Ej gjort
            </span>
            <span className={styles.legendSwatch}>
              <Check size={12} strokeWidth={3} /> Gjort via session
            </span>
            <span className={styles.legendSwatch}>
              <Check size={12} strokeWidth={1.5} /> Manuellt markerat
            </span>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p className={styles.modalText}>Ta bort detta provtillfälle?</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { onRemove(confirmDel); setConfirmDel(null); }} className={styles.dangerBtn}>
                Ta bort
              </button>
              <button onClick={() => setConfirmDel(null)} className={styles.btnGhost}>Avbryt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExamCell({ done, fromSession, color, onClick }) {
  return (
    <td className={styles.thSec}>
      <button
        title={fromSession ? 'Gjort via sessionslogg' : done ? 'Manuellt markerat' : 'Klicka för att markera'}
        onClick={onClick}
        className={`${styles.cellBtn} ${done ? styles.cellDone : ''}`}
        style={done ? { backgroundColor: color + '22', color, borderColor: color + '66' } : {}}
      >
        {done && (fromSession ? <Check size={12} strokeWidth={3} /> : <Check size={12} strokeWidth={1.5} />)}
      </button>
    </td>
  );
}
