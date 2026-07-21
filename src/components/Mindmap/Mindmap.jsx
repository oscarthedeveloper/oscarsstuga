import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2 } from '@site/src/components/HP/icons';
import { useSyncedState, genId } from '@site/src/lib/useSyncedState';
import styles from './mindmap.module.css';

// Idékarta / Mindmap — redaktionell svartvit poster-stil (inspirerad av handritade
// konceptkartor): cirkelnoder, streckade kurvade kanter, koncentriska ringar,
// beskrivning som sidotext. Full interaktion: pan/zoom, hopfällning, inline-redigering,
// pilnavigering, omordning, kortkommandon, ångra/gör om, molnsynk.

const DEFAULT = {
  id: 'root',
  title: 'Framtid',
  description: 'Mina idéer och tankar om framtiden.',
  children: [
    { id: 'seed1', title: 'Wien & tyska', description: 'Jobba i Wien och lära mig tyska.', children: [] },
    { id: 'seed2', title: 'Madrid & spanska', description: 'EU-projekt i Madrid och lära mig spanska.', children: [] },
    { id: 'seed3', title: 'Läkare eller lärare?', description: '', children: [] },
  ],
};

const MIN_K = 0.15;
const MAX_K = 3.5;
// Avståndet mellan nivåerna krymper för varje led — ju djupare, desto tätare.
const RING_BASE = 205; // roten → första nivån
const RING_STEP = 175; // första steget mellan djupare nivåer
const RING_DECAY = 0.7; // hur mycket steget krymper per nivå
const RING_MIN = 82; // minsta avstånd så noderna inte överlappar
const SIB_GAP = 170; // tangentiellt avstånd mellan syskon (mindre = tätare)
const radiusAt = (depth) => {
  if (depth <= 0) return 0;
  let r = RING_BASE;
  for (let d = 2; d <= depth; d += 1) r += Math.max(RING_MIN, RING_STEP * RING_DECAY ** (d - 2));
  return r;
};

// Distinkta färger — varje nod får en stabil färg utifrån sitt id (ser slumpmässig ut
// men ändras inte mellan omritningar/omladdningar).
const PALETTE = ['#2563eb', '#db2777', '#059669', '#d97706', '#7c3aed', '#0891b2', '#dc2626', '#4d7c0f', '#c026d3', '#ea580c'];
function colorFor(id) {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const sizeOf = (title, isRoot, depth) => {
  const len = (title || 'Ny idé').length;
  const min = isRoot ? 136 : depth === 1 ? 88 : 70;
  return Math.round(clamp(48 + len * 2.7, min, 232));
};

// ── Trädhjälpare (immutabla) ──
function mapTree(node, fn) {
  const n = fn(node);
  return { ...n, children: (n.children || []).map((c) => mapTree(c, fn)) };
}
const patchNode = (root, id, patch) => mapTree(root, (n) => (n.id === id ? { ...n, ...patch } : n));
const addChildTo = (root, parentId, child) =>
  mapTree(root, (n) => (n.id === parentId ? { ...n, children: [...(n.children || []), child] } : n));
function removeNode(root, id) {
  const rec = (n) => ({ ...n, children: (n.children || []).filter((c) => c.id !== id).map(rec) });
  return rec(root);
}
function reorderChild(root, parentId, id, dir) {
  const rec = (n) => {
    let kids = (n.children || []).map(rec);
    if (n.id === parentId) {
      const i = kids.findIndex((c) => c.id === id);
      const j = i + dir;
      if (i >= 0 && j >= 0 && j < kids.length) { const c = [...kids]; [c[i], c[j]] = [c[j], c[i]]; kids = c; }
    }
    return { ...n, children: kids };
  };
  return rec(root);
}
function setAllCollapsed(root, val) {
  const rec = (n, isRoot) => {
    const children = (n.children || []).map((c) => rec(c, false));
    const collapsed = isRoot ? false : children.length > 0 ? val : false;
    return { ...n, collapsed, children };
  };
  return rec(root, true);
}
function findNode(root, id) {
  if (!root) return null;
  if (root.id === id) return root;
  for (const c of root.children || []) {
    const f = findNode(c, id);
    if (f) return f;
  }
  return null;
}
const makeNode = (title = '') => ({ id: genId(), title, description: '', children: [] });

// ── Radiell layout: trimmade kurvade kanter + koncentriska ringar ──
function layout(root) {
  const nodes = [];
  const edges = [];
  let maxDepth = 0;
  const leaves = (n) =>
    n.collapsed || !n.children || !n.children.length ? 1 : n.children.reduce((s, c) => s + leaves(c), 0);
  const countAll = (n) => (!n.children ? 0 : n.children.reduce((s, c) => s + 1 + countAll(c), 0));

  function place(n, depth, a0, a1, parent) {
    const angle = (a0 + a1) / 2;
    const r = radiusAt(depth);
    const x = depth === 0 ? 0 : r * Math.cos(angle);
    const y = depth === 0 ? 0 : r * Math.sin(angle);
    const kids = n.children || [];
    const size = sizeOf(n.title, depth === 0, depth);
    maxDepth = Math.max(maxDepth, depth);
    const color = colorFor(n.id);
    nodes.push({
      id: n.id, title: n.title, description: n.description, depth, x, y, size, color,
      collapsed: !!n.collapsed, hasChildren: kids.length > 0, hiddenCount: n.collapsed ? countAll(n) : 0,
    });
    if (parent) {
      const dx = x - parent.x, dy = y - parent.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const sx = parent.x + ux * (parent.size / 2 + 2), sy = parent.y + uy * (parent.size / 2 + 2);
      const ex = x - ux * (size / 2 + 2), ey = y - uy * (size / 2 + 2);
      const ddx = ex - sx, ddy = ey - sy;
      edges.push({ d: `M${sx},${sy} C${sx + ddx * 0.5},${sy + ddy * 0.15} ${sx + ddx * 0.5},${sy + ddy * 0.85} ${ex},${ey}`, color });
    }
    if (n.collapsed || !kids.length) return;
    const total = leaves(n);
    // Syskon sprids inte över hela sektorn — de packas med ett litet fast
    // tangentiellt mellanrum (SIB_GAP) och centreras utåt, så de står nära varandra.
    const sector = a1 - a0;
    const childR = radiusAt(depth + 1);
    const perLeaf = Math.min(sector / total, SIB_GAP / childR);
    const used = perLeaf * total;
    let a = (a0 + a1) / 2 - used / 2;
    kids.forEach((c) => {
      const span = used * (leaves(c) / total);
      place(c, depth + 1, a, a + span, { x, y, size });
      a += span;
    });
  }
  place(root, 0, -Math.PI / 2, (3 * Math.PI) / 2, null);
  const rings = [];
  for (let d = 1; d <= maxDepth; d += 1) rings.push(radiusAt(d));
  return { nodes, edges, rings };
}

export default function Mindmap({ fullscreen = false }) {
  const { value, update, ready, cloud } = useSyncedState('mera_mindmap', DEFAULT);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [animated, setAnimated] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const viewportRef = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const didFit = useRef(false);
  const centerNext = useRef(false);

  const root = value && value.id ? value : DEFAULT;
  const { nodes, edges, rings } = useMemo(() => layout(root), [root]);
  const parentMap = useMemo(() => {
    const m = {};
    const rec = (n) => (n.children || []).forEach((c) => { m[c.id] = n.id; rec(c); });
    rec(root);
    return m;
  }, [root]);
  const selected = selectedId ? findNode(root, selectedId) : null;

  // ── Historik ──
  const commit = useCallback((tree) => update(() => tree), [update]);
  const pushHistory = useCallback(() => { setPast((p) => [...p, root]); setFuture([]); }, [root]);
  const undo = useCallback(() => {
    setPast((p) => { if (!p.length) return p; setFuture((f) => [...f, root]); commit(p[p.length - 1]); return p.slice(0, -1); });
  }, [root, commit]);
  const redo = useCallback(() => {
    setFuture((f) => { if (!f.length) return f; setPast((p) => [...p, root]); commit(f[f.length - 1]); return f.slice(0, -1); });
  }, [root, commit]);

  // ── Zoom/panorering ──
  const zoomAt = useCallback((clientX, clientY, ratio) => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const lx = clientX - rect.left, ly = clientY - rect.top;
    setView((v) => {
      const k = clamp(v.k * ratio, MIN_K, MAX_K);
      return { k, x: lx - ((lx - v.x) / v.k) * k, y: ly - ((ly - v.y) / v.k) * k };
    });
  }, []);
  const centerZoom = (ratio) => {
    const el = viewportRef.current;
    if (!el) return;
    setAnimated(true);
    const r = el.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, ratio);
  };
  const centerOn = useCallback((id) => {
    const el = viewportRef.current;
    const n = nodes.find((x) => x.id === id);
    if (!el || !n) return false;
    const rect = el.getBoundingClientRect();
    setAnimated(true);
    setView((v) => ({ k: v.k, x: rect.width / 2 - n.x * v.k, y: rect.height / 2 - n.y * v.k }));
    return true;
  }, [nodes]);
  const fitView = useCallback(() => {
    const el = viewportRef.current;
    if (!el || !nodes.length) return;
    const rect = el.getBoundingClientRect();
    const pad = 130;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.x - n.size / 2); maxX = Math.max(maxX, n.x + n.size / 2);
      minY = Math.min(minY, n.y - n.size / 2); maxY = Math.max(maxY, n.y + n.size / 2);
    }
    const bw = maxX - minX || 1, bh = maxY - minY || 1;
    const k = clamp(Math.min((rect.width - pad * 2) / bw, (rect.height - pad * 2) / bh, 1.3), MIN_K, MAX_K);
    setAnimated(true);
    setView({ k, x: rect.width / 2 - ((minX + maxX) / 2) * k, y: rect.height / 2 - ((minY + maxY) / 2) * k });
  }, [nodes]);

  useEffect(() => {
    if (ready && !didFit.current && viewportRef.current) { didFit.current = true; fitView(); }
  }, [ready, fitView]);

  // Centrera på vald nod efter navigering (även efter att en gren expanderats)
  useEffect(() => {
    if (centerNext.current && selectedId) { if (centerOn(selectedId)) centerNext.current = false; }
  }, [selectedId, nodes, centerOn]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    const onWheel = (e) => { e.preventDefault(); setAnimated(false); zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015)); };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  // ── Pekare: 1 = panorera, 2 = nypa-zooma ──
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  function baseline() {
    const pts = [...pointers.current.values()];
    if (pts.length === 1) gesture.current = { type: 'pan', x: pts[0].x, y: pts[0].y };
    else if (pts.length >= 2) gesture.current = { type: 'pinch', dist: dist(pts[0], pts[1]), mid: mid(pts[0], pts[1]) };
    else gesture.current = null;
  }
  function onPointerDown(e) {
    if (e.target.closest(`.${styles.node}`) || e.target.closest(`.${styles.panel}`) || e.target.closest(`.${styles.toolbar}`)) return;
    if (editingId) commitEdit();
    setAnimated(false);
    viewportRef.current.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    baseline();
    if (pointers.current.size === 1) setSelectedId(null);
  }
  function onPointerMove(e) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const g = gesture.current;
    if (pts.length >= 2) {
      const d = dist(pts[0], pts[1]), m = mid(pts[0], pts[1]);
      if (!g || g.type !== 'pinch') { gesture.current = { type: 'pinch', dist: d, mid: m }; return; }
      const prevDist = g.dist || d;
      const dmx = m.x - g.mid.x, dmy = m.y - g.mid.y;
      g.dist = d; g.mid = m;
      zoomAt(m.x, m.y, d / prevDist);
      setView((v) => ({ ...v, x: v.x + dmx, y: v.y + dmy }));
    } else if (g && g.type === 'pan') {
      const dx = e.clientX - g.x, dy = e.clientY - g.y;
      g.x = e.clientX; g.y = e.clientY;
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    }
  }
  function onPointerUp(e) { pointers.current.delete(e.pointerId); baseline(); }

  // ── Redigering ──
  function startEdit(id) {
    const n = findNode(root, id);
    if (!n) return;
    pushHistory();
    setSelectedId(id);
    setEditingId(id);
    setDraft(n.title || '');
  }
  function commitEdit() {
    if (!editingId) return;
    commit(patchNode(root, editingId, { title: draft.trim() || 'Ny idé' }));
    setEditingId(null);
  }
  function addChildAndEdit(parentId, baseTree) {
    const child = makeNode('');
    commit(addChildTo(baseTree, parentId, child));
    setSelectedId(child.id);
    setEditingId(child.id);
    setDraft('');
    centerNext.current = true;
  }
  function newChild(parentId) {
    pushHistory();
    addChildAndEdit(parentId, patchNode(root, parentId, { collapsed: false }));
  }
  function editorKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const id = editingId;
      const pid = parentMap[id];
      let next = patchNode(root, id, { title: draft.trim() || 'Ny idé' });
      if (pid) { const sib = makeNode(''); next = addChildTo(next, pid, sib); commit(next); setSelectedId(sib.id); setEditingId(sib.id); setDraft(''); }
      else { commit(next); setEditingId(null); }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const id = editingId;
      const child = makeNode('');
      commit(addChildTo(patchNode(root, id, { title: draft.trim() || 'Ny idé', collapsed: false }), id, child));
      setSelectedId(child.id); setEditingId(child.id); setDraft('');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      commitEdit();
    }
  }

  const toggleCollapse = (id) => { pushHistory(); commit(patchNode(root, id, { collapsed: !findNode(root, id).collapsed })); };
  const deleteNode = (id) => {
    if (id === root.id) return;
    pushHistory();
    const pid = parentMap[id];
    commit(removeNode(root, id));
    setSelectedId(pid || null);
  };
  const setDescription = (id, description) => commit(patchNode(root, id, { description }));
  const collapseAll = () => { pushHistory(); commit(setAllCollapsed(root, true)); };
  const expandAll = () => { pushHistory(); commit(setAllCollapsed(root, false)); };

  // ── Navigering & omordning ──
  const goParent = () => { const pid = parentMap[selectedId]; if (pid) { centerNext.current = true; setSelectedId(pid); } };
  const goChild = () => {
    const n = findNode(root, selectedId);
    if (!n || !(n.children || []).length) return;
    if (n.collapsed) { pushHistory(); commit(patchNode(root, selectedId, { collapsed: false })); }
    centerNext.current = true; setSelectedId(n.children[0].id);
  };
  const goSibling = (dir) => {
    const pid = parentMap[selectedId];
    if (!pid) return;
    const arr = findNode(root, pid).children;
    const i = arr.findIndex((c) => c.id === selectedId);
    const j = (i + dir + arr.length) % arr.length;
    centerNext.current = true; setSelectedId(arr[j].id);
  };
  const moveSibling = (dir) => { const pid = parentMap[selectedId]; if (!pid) return; pushHistory(); commit(reorderChild(root, pid, selectedId, dir)); };

  // ── Tangentbordsgenvägar ──
  useEffect(() => {
    function onKey(e) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (mod && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); return; }
      if (editingId) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (!selectedId) {
        if (e.key.startsWith('Arrow')) { e.preventDefault(); centerNext.current = true; setSelectedId(root.id); }
        return;
      }
      switch (e.key) {
        case 'Tab': e.preventDefault(); newChild(selectedId); break;
        case 'Enter': { e.preventDefault(); const pid = parentMap[selectedId]; if (pid) { pushHistory(); addChildAndEdit(pid, root); } break; }
        case 'Delete': case 'Backspace': e.preventDefault(); deleteNode(selectedId); break;
        case 'F2': e.preventDefault(); startEdit(selectedId); break;
        case 'f': case 'F': e.preventDefault(); centerOn(selectedId); break;
        case 'Escape': setSelectedId(null); break;
        case 'ArrowLeft': e.preventDefault(); goParent(); break;
        case 'ArrowRight': e.preventDefault(); goChild(); break;
        case 'ArrowUp': e.preventDefault(); if (e.altKey) moveSibling(-1); else goSibling(-1); break;
        case 'ArrowDown': e.preventDefault(); if (e.altKey) moveSibling(1); else goSibling(1); break;
        default: break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, editingId, draft, root, parentMap, centerOn]);

  if (!ready) return null;

  const showDetail = (n) => n.id === selectedId || view.k >= 1.05;
  const pct = Math.round(view.k * 100);

  return (
    <div className={`${styles.wrap} ${fullscreen ? styles.wrapFull : ''}`}>
      <div
        ref={viewportRef}
        className={`${styles.viewport} ${fullscreen ? styles.viewportFull : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(e) => { if (!e.target.closest(`.${styles.node}`)) fitView(); }}
      >
        <div
          className={styles.world}
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`, transition: animated ? 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)' : 'none' }}
          onTransitionEnd={() => setAnimated(false)}
        >
          <svg className={styles.canvas} width="1" height="1">
            {rings.map((r, i) => (<circle key={`r${i}`} className={styles.ring} cx="0" cy="0" r={r} />))}
            {edges.map((e, i) => (<path key={`e${i}`} className={styles.edge} d={e.d} stroke={e.color} />))}
          </svg>

          {nodes.map((n) => {
            const isRoot = n.id === root.id;
            const isSel = n.id === selectedId;
            const isEditing = n.id === editingId;
            const isHub = isRoot || n.hasChildren;
            const cls = [
              styles.node,
              isRoot ? styles.nodeRoot : isHub ? styles.nodeHub : styles.nodeLeaf,
              isSel ? styles.nodeSelected : '',
              isHub ? styles.hub : '',
            ].join(' ');
            const fontSize = isRoot ? undefined : n.title && n.title.length > 24 ? '0.62rem' : n.title && n.title.length > 14 ? '0.68rem' : '0.74rem';
            return (
              <div
                key={n.id}
                className={cls}
                data-side={n.x < -1 ? 'left' : 'right'}
                style={{ left: n.x, top: n.y, width: n.size, height: n.size, '--branch': n.color }}
                onPointerDown={(ev) => ev.stopPropagation()}
                onClick={(ev) => { ev.stopPropagation(); if (!isEditing) setSelectedId(n.id); }}
                onDoubleClick={(ev) => { ev.stopPropagation(); startEdit(n.id); }}
              >
                {isEditing ? (
                  <input
                    className={styles.nodeInput}
                    autoFocus
                    value={draft}
                    placeholder="Skriv…"
                    onChange={(ev) => setDraft(ev.target.value)}
                    onKeyDown={editorKeyDown}
                    onBlur={commitEdit}
                    onFocus={(ev) => ev.target.select()}
                  />
                ) : (
                  <span className={styles.nodeTitle} style={fontSize ? { fontSize } : undefined}>{n.title || 'Utan titel'}</span>
                )}

                {n.description && showDetail(n) && !isEditing && (<div className={styles.sideText}>{n.description}</div>)}

                {n.hasChildren && !isEditing && (
                  <button
                    type="button"
                    className={styles.collapseBtn}
                    title={n.collapsed ? `Expandera (${n.hiddenCount})` : 'Fäll ihop'}
                    onPointerDown={(ev) => ev.stopPropagation()}
                    onClick={(ev) => { ev.stopPropagation(); toggleCollapse(n.id); }}
                  >
                    {n.collapsed ? n.hiddenCount : '–'}
                  </button>
                )}
                {isSel && !isEditing && (
                  <button
                    type="button"
                    className={styles.nodeAdd}
                    title="Lägg till undernod (Tab)"
                    onPointerDown={(ev) => ev.stopPropagation()}
                    onClick={(ev) => { ev.stopPropagation(); newChild(n.id); }}
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Verktygsrad */}
        <div className={styles.toolbar}>
          <span className={styles.brand}>
            Mindmap
            <span className={`${styles.cloudDot} ${cloud ? styles.cloudOn : styles.cloudOff}`} title={cloud ? 'Synkas till molnet' : 'Endast lokalt'} />
          </span>
          <button className={styles.btn} onClick={() => newChild(root.id)}><Plus size={14} /> Ny idé</button>
          <span className={styles.sep} />
          <button className={styles.iconBtn} title="Ångra (Ctrl+Z)" disabled={!past.length} onClick={undo}>↶</button>
          <button className={styles.iconBtn} title="Gör om (Ctrl+Shift+Z)" disabled={!future.length} onClick={redo}>↷</button>
          <span className={styles.sep} />
          <button className={styles.iconBtn} title="Fäll ihop alla" onClick={collapseAll}>⊟</button>
          <button className={styles.iconBtn} title="Expandera alla" onClick={expandAll}>⊞</button>
          <span className={styles.sep} />
          <button className={styles.iconBtn} title="Zooma ut" onClick={() => centerZoom(1 / 1.2)}>−</button>
          <span className={styles.zoomPct}>{pct}%</span>
          <button className={styles.iconBtn} title="Zooma in" onClick={() => centerZoom(1.2)}>+</button>
          <button className={styles.iconBtn} title="Anpassa (dubbelklicka bakgrunden)" onClick={fitView}>⤢</button>
        </div>

        {/* Inspektörspanel */}
        {selected && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>{selected.title || 'Utan titel'}</span>
              <button className={styles.panelClose} onClick={() => setSelectedId(null)} title="Stäng">✕</button>
            </div>
            <textarea
              className={styles.control}
              placeholder="Beskrivning (valfri) — visas bredvid noden när du zoomar in"
              value={selected.description || ''}
              onFocus={pushHistory}
              onChange={(e) => setDescription(selected.id, e.target.value)}
            />
            <div className={styles.panelActions}>
              <button className={styles.btn} onClick={() => newChild(selected.id)}><Plus size={14} /> Undernod</button>
              <button className={styles.btnGhost} onClick={() => startEdit(selected.id)}>Byt namn</button>
              {selected.id !== root.id && (
                <>
                  <button className={styles.iconBtnSm} title="Flytta upp (Alt+↑)" onClick={() => moveSibling(-1)}>↑</button>
                  <button className={styles.iconBtnSm} title="Flytta ned (Alt+↓)" onClick={() => moveSibling(1)}>↓</button>
                  <button className={styles.btnDanger} title="Ta bort (Del)" onClick={() => deleteNode(selected.id)}><Trash2 size={14} /></button>
                </>
              )}
            </div>
          </div>
        )}

        <div className={styles.hint}>
          <b>Tab</b> undernod · <b>Enter</b> syskon · <b>piltangenter</b> navigera · <b>Alt+↑↓</b> ordna · <b>F2</b> namn · <b>F</b> fokusera · <b>Del</b> ta bort
        </div>
      </div>
    </div>
  );
}
