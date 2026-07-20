import React, { useState, useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import { marked } from 'marked';
import { Trash2 } from '@site/src/components/HP/icons';
import { useSyncedState } from '@site/src/lib/useSyncedState';
import styles from './notes.module.css';

function mdToHtml(src) {
  const safe = (src || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return marked.parse(safe, { breaks: true });
}
function contentOf(note) {
  if (note.html != null && note.html !== '') return note.html;
  if (note.body) return mdToHtml(note.body);
  return '';
}
function slugify(t) {
  return (t || '')
    .toLowerCase().trim()
    .replace(/[^\wà-öø-ÿåäö\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

export default function NoteEditor({ lang, id, base = 'sprak' }) {
  const collection = `notes_${lang}`;
  const { value: notes, update, ready } = useSyncedState(collection, []);
  const [title, setTitle] = useState('');
  const [toc, setToc] = useState([]);
  const [active, setActive] = useState(null);
  const [tablePos, setTablePos] = useState(null);
  const editorRef = useRef(null);
  const mainRef = useRef(null);
  const loadedIdRef = useRef(null);
  const saveTimer = useRef(null);
  const savedRangeRef = useRef(null);
  const activeTableRef = useRef(null);
  const activeCellRef = useRef(null);

  const note = notes.find((n) => n.id === id) || null;

  function buildToc() {
    const el = editorRef.current;
    if (!el) return;
    const heads = el.querySelectorAll('h1, h2, h3, h4');
    const items = [];
    const seen = {};
    heads.forEach((h, i) => {
      const text = h.textContent.trim();
      if (!text) return;
      let b = slugify(text) || 'rubrik';
      let hid = b;
      let k = 1;
      while (seen[hid]) hid = `${b}-${k++}`;
      seen[hid] = true;
      h.id = hid;
      items.push({ id: hid, text, level: Number(h.tagName[1]) });
    });
    setToc(items);
  }

  useEffect(() => {
    const el = editorRef.current;
    if (!note || !el) return;
    if (loadedIdRef.current === note.id) return;
    el.innerHTML = contentOf(note);
    setTitle(note.title || '');
    loadedIdRef.current = note.id;
    buildToc();
  });

  useEffect(() => {
    function onScroll() {
      const el = editorRef.current;
      if (!el) return;
      const heads = Array.from(el.querySelectorAll('h1, h2, h3, h4'));
      let current = null;
      for (const h of heads) {
        if (h.getBoundingClientRect().top <= 130) current = h.id;
        else break;
      }
      setActive(current);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [toc]);

  // Spara markörens position i editorn + upptäck aktiv tabell (för +rad/+kolumn)
  useEffect(() => {
    function onSelChange() {
      const el = editorRef.current;
      const m = mainRef.current;
      if (!el) return;
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      if (!el.contains(range.commonAncestorContainer)) return;
      savedRangeRef.current = range.cloneRange();

      let node = range.startContainer;
      node = node.nodeType === 3 ? node.parentNode : node;
      const table = node && node.closest ? node.closest('table') : null;
      if (table && el.contains(table) && m) {
        const mr = m.getBoundingClientRect();
        const r = table.getBoundingClientRect();
        activeTableRef.current = table;
        activeCellRef.current = node.closest ? node.closest('td, th') : null;
        setTablePos({ top: r.top - mr.top, bottom: r.bottom - mr.top, left: r.left - mr.left, right: r.right - mr.left });
      } else {
        activeTableRef.current = null;
        activeCellRef.current = null;
        setTablePos(null);
      }
    }
    document.addEventListener('selectionchange', onSelChange);
    return () => document.removeEventListener('selectionchange', onSelChange);
  }, []);

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  if (!ready) return null;

  const backLink = `/${base}/${lang}/anteckningar`;

  if (!lang || !id) {
    return <div className={styles.wrap}><div className={styles.empty}>Ogiltig länk.</div></div>;
  }
  if (!note) {
    return (
      <div className={styles.wrap}>
        <Link className={styles.back} to={backLink}>← Tillbaka</Link>
        <div className={styles.empty}>Laddar anteckningen … (dyker den inte upp kan du gå tillbaka och försöka igen).</div>
      </div>
    );
  }

  function commit(patch) {
    update((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)));
  }
  function doSave() {
    if (editorRef.current) commit({ html: editorRef.current.innerHTML, body: '' });
  }
  function scheduleSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(doSave, 600);
  }
  function saveNow() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    doSave();
  }
  function onInput() {
    scheduleSave();
    buildToc();
  }
  function remove() {
    if (!window.confirm('Ta bort anteckningen?')) return;
    update((prev) => prev.filter((n) => n.id !== id));
    window.location.href = backLink;
  }
  function goTo(hid) {
    const el = document.getElementById(hid);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function placeCaretAtStart(el) {
    const r = document.createRange();
    r.setStart(el, 0);
    r.collapse(true);
    const s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }
  function transformBlock(block, tag) {
    const root = editorRef.current;
    const el = document.createElement(tag);
    if (block === root) {
      el.appendChild(document.createElement('br'));
      root.appendChild(el);
    } else {
      while (block.firstChild) el.appendChild(block.firstChild);
      if (!el.firstChild) el.appendChild(document.createElement('br'));
      block.parentNode.replaceChild(el, block);
    }
    placeCaretAtStart(el);
  }

  function onFocus() {
    const el = editorRef.current;
    if (!el) return;
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch { /* noop */ }
    if (el.innerHTML.trim() === '' || el.innerHTML === '<br>') {
      el.innerHTML = '<p><br></p>';
      placeCaretAtStart(el.firstChild);
    }
  }

  // ── Infoga-verktyg ─────────────────────────────────────────────
  function focusEditor() {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const range = savedRangeRef.current;
    if (range && el.contains(range.commonAncestorContainer)) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
  function exec(cmd) {
    focusEditor();
    try { document.execCommand(cmd, false, null); } catch { /* noop */ }
    scheduleSave();
  }
  function insertHTML(html) {
    focusEditor();
    try { document.execCommand('insertHTML', false, html); } catch { /* noop */ }
    scheduleSave();
    buildToc();
  }
  function insertTable() {
    insertHTML('<table><thead><tr><th>Rubrik&nbsp;1</th><th>Rubrik&nbsp;2</th></tr></thead><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p><br></p>');
  }
  function insertAdmonition(type, label) {
    insertHTML(`<div class="admonition admonition-${type}"><div class="admonitionHeading">${label}</div><div class="admonitionContent"><p>Skriv här …</p></div></div><p><br></p>`);
  }
  function insertTabs() {
    insertHTML('<div class="notesTabs"><div class="notesTabList"><span class="notesTab notesTabActive" data-tab="0">Flik 1</span><span class="notesTab" data-tab="1">Flik 2</span><span class="notesTabAdd" contenteditable="false" title="Lägg till flik">+</span></div><div class="notesTabPanels"><div class="notesTabPanel" data-panel="0"><p>Innehåll 1</p></div><div class="notesTabPanel notesTabHidden" data-panel="1"><p>Innehåll 2</p></div></div></div><p><br></p>');
  }

  // Gör om aktuellt block till vanlig brödtext (paragraf)
  function toParagraph() {
    focusEditor();
    const root = editorRef.current;
    if (!root) return;
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    let node = sel.getRangeAt(0).startContainer;
    node = node.nodeType === 3 ? node.parentNode : node;

    const list = node.closest ? node.closest('ul, ol') : null;
    if (list && root.contains(list)) {
      document.execCommand(list.tagName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');
      scheduleSave();
      buildToc();
      return;
    }

    let block = node;
    while (block && block.parentNode !== root && block !== root) block = block.parentNode;
    if (block && block !== root && block.tagName && block.tagName !== 'P') {
      transformBlock(block, 'p');
    } else {
      try { document.execCommand('formatBlock', false, 'p'); } catch { /* noop */ }
    }
    scheduleSave();
    buildToc();
  }

  function refreshTablePos() {
    const t = activeTableRef.current;
    const m = mainRef.current;
    if (!t || !m) return;
    const mr = m.getBoundingClientRect();
    const r = t.getBoundingClientRect();
    setTablePos({ top: r.top - mr.top, bottom: r.bottom - mr.top, left: r.left - mr.left, right: r.right - mr.left });
  }
  function addColumn() {
    const t = activeTableRef.current;
    if (!t) return;
    t.querySelectorAll('tr').forEach((tr) => {
      const inHead = !!tr.closest('thead');
      const cell = document.createElement(inHead ? 'th' : 'td');
      cell.innerHTML = inHead ? 'Rubrik' : ' ';
      tr.appendChild(cell);
    });
    scheduleSave();
    refreshTablePos();
  }
  function addRow() {
    const t = activeTableRef.current;
    if (!t) return;
    const tbody = t.querySelector('tbody') || t;
    const anyRow = t.querySelector('tr');
    const cols = anyRow ? anyRow.children.length : 2;
    const tr = document.createElement('tr');
    for (let i = 0; i < cols; i += 1) {
      const td = document.createElement('td');
      td.innerHTML = ' ';
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
    scheduleSave();
    refreshTablePos();
  }
  function finishTableEdit() {
    const t = activeTableRef.current;
    if (!t || !t.querySelector('td, th')) {
      if (t) t.remove();
      activeTableRef.current = null;
      activeCellRef.current = null;
      setTablePos(null);
    } else {
      activeCellRef.current = null;
      refreshTablePos();
    }
    scheduleSave();
    buildToc();
  }
  function deleteRow() {
    const cell = activeCellRef.current;
    const tr = cell ? cell.closest('tr') : null;
    if (tr) tr.remove();
    finishTableEdit();
  }
  function deleteColumn() {
    const t = activeTableRef.current;
    const cell = activeCellRef.current;
    if (!t || !cell) return;
    const row = cell.closest('tr');
    const idx = Array.prototype.indexOf.call(row.children, cell);
    if (idx < 0) return;
    t.querySelectorAll('tr').forEach((tr) => {
      if (tr.children[idx]) tr.children[idx].remove();
    });
    finishTableEdit();
  }
  function deleteTable() {
    const t = activeTableRef.current;
    if (!t) return;
    if (!window.confirm('Ta bort hela tabellen?')) return;
    t.remove();
    activeTableRef.current = null;
    activeCellRef.current = null;
    setTablePos(null);
    scheduleSave();
    buildToc();
  }

  // Klick i editorn: byt flik / lägg till flik
  function onEditorClick(e) {
    const addBtn = e.target.closest && e.target.closest('.notesTabAdd');
    if (addBtn) {
      const container = addBtn.closest('.notesTabs');
      if (container) {
        const list = container.querySelector('.notesTabList');
        const panels = container.querySelector('.notesTabPanels');
        const n = container.querySelectorAll('.notesTab').length;
        const tab = document.createElement('span');
        tab.className = 'notesTab';
        tab.setAttribute('data-tab', String(n));
        tab.textContent = `Flik ${n + 1}`;
        list.insertBefore(tab, addBtn);
        const panel = document.createElement('div');
        panel.className = 'notesTabPanel notesTabHidden';
        panel.setAttribute('data-panel', String(n));
        panel.innerHTML = `<p>Innehåll ${n + 1}</p>`;
        panels.appendChild(panel);
        scheduleSave();
      }
      return;
    }
    const tab = e.target.closest && e.target.closest('.notesTab');
    if (!tab) return;
    const container = tab.closest('.notesTabs');
    if (!container) return;
    const idx = tab.getAttribute('data-tab');
    container.querySelectorAll('.notesTab').forEach((t) => t.classList.toggle('notesTabActive', t.getAttribute('data-tab') === idx));
    container.querySelectorAll('.notesTabPanel').forEach((p) => p.classList.toggle('notesTabHidden', p.getAttribute('data-panel') !== idx));
    scheduleSave();
  }

  const noBlur = (e) => e.preventDefault();

  function onKeyDown(e) {
    if (e.key !== ' ') return;
    const sel = window.getSelection();
    if (!sel || !sel.isCollapsed || !sel.rangeCount) return;
    const root = editorRef.current;
    if (!root) return;
    const range = sel.getRangeAt(0);

    let block = range.startContainer;
    block = block.nodeType === 3 ? block.parentNode : block;
    while (block && block.parentNode !== root && block !== root) block = block.parentNode;
    const target = block === root ? root : block;

    const probe = document.createRange();
    probe.selectNodeContents(target);
    probe.setEnd(range.startContainer, range.startOffset);
    const before = probe.toString().replace(/ /g, ' ').trim();

    const rules = [
      [/^(#{1,6})$/, 'heading'],
      [/^>$/, 'blockquote'],
      [/^[-*+]$/, 'ul'],
      [/^\d+\.$/, 'ol'],
    ];
    for (const [re, kind] of rules) {
      const m = before.match(re);
      if (!m) continue;
      e.preventDefault();

      const del = document.createRange();
      del.selectNodeContents(target);
      del.setEnd(range.startContainer, range.startOffset);
      del.deleteContents();

      if (kind === 'heading') {
        transformBlock(target, 'h' + m[1].length);
      } else if (kind === 'blockquote') {
        transformBlock(target, 'blockquote');
      } else {
        placeCaretAtStart(target);
        document.execCommand(kind === 'ul' ? 'insertUnorderedList' : 'insertOrderedList');
      }
      scheduleSave();
      buildToc();
      return;
    }
  }

  const ADMS = [
    ['note', 'NOTERA'],
    ['tip', 'TIPS'],
    ['info', 'INFO'],
    ['warning', 'VARNING'],
    ['danger', 'FARA'],
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.pageLayout}>
        <div className={styles.main} ref={mainRef}>
          <Link className={styles.back} to={backLink} onClick={saveNow}>← Tillbaka till anteckningar</Link>
          <div className={styles.editorTop}>
            <span className={styles.saved}>Sparas automatiskt · skriv # för rubrik, - för lista</span>
            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Ta bort" onClick={remove}><Trash2 size={16} /></button>
          </div>

          <input
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => { if (title !== (note.title ?? '')) commit({ title: title.trim() || 'Utan titel' }); }}
            placeholder="Rubrik"
          />

          <div
            ref={editorRef}
            className={`markdown ${styles.editor}`}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            data-placeholder="Skriv här … # blir en rubrik, ## en underrubrik, - en punktlista"
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            onInput={onInput}
            onClick={onEditorClick}
            onBlur={saveNow}
          />

          {tablePos && (
            <div
              className={styles.tableToolbar}
              style={{ top: Math.max(0, tablePos.top - 34), left: tablePos.left }}
              onMouseDown={noBlur}
            >
              <button className={styles.tableBtn} onClick={addRow} title="Lägg till rad">+ rad</button>
              <button className={styles.tableBtn} onClick={deleteRow} title="Ta bort raden">− rad</button>
              <button className={styles.tableBtn} onClick={addColumn} title="Lägg till kolumn">+ kol</button>
              <button className={styles.tableBtn} onClick={deleteColumn} title="Ta bort kolumnen">− kol</button>
              <button className={`${styles.tableBtn} ${styles.tableBtnDanger}`} onClick={deleteTable} title="Ta bort tabellen">Ta bort tabell</button>
            </div>
          )}
        </div>

        <aside className={styles.toc}>
          <div className={styles.tocTitle}>På denna sida</div>
          {toc.length === 0 ? (
            <div className={styles.tocEmpty}>Inga rubriker än</div>
          ) : (
            <ul className={styles.tocList}>
              {toc.map((t) => (
                <li key={t.id}>
                  <button
                    className={`${styles.tocLink} ${styles['tocL' + t.level] || ''} ${active === t.id ? styles.tocActive : ''}`}
                    onClick={() => goTo(t.id)}
                  >
                    {t.text}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.insertPanel}>
            <div className={styles.insertPanelTitle}>Infoga</div>
            <div className={styles.insertGrid}>
              <button className={styles.insertBtn} onMouseDown={noBlur} onClick={toParagraph} title="Gör om till vanlig brödtext">Brödtext</button>
              <button className={styles.insertBtn} onMouseDown={noBlur} onClick={() => exec('bold')} title="Fet"><b>B</b></button>
              <button className={styles.insertBtn} onMouseDown={noBlur} onClick={() => exec('italic')} title="Kursiv"><em>I</em></button>
              <button className={styles.insertBtn} onMouseDown={noBlur} onClick={insertTable} title="Infoga tabell">Tabell</button>
              <button className={styles.insertBtn} onMouseDown={noBlur} onClick={insertTabs} title="Infoga flikar">Flikar</button>
            </div>
            <div className={styles.insertLabel}>Notis</div>
            <div className={styles.insertGrid}>
              {ADMS.map(([type, label]) => (
                <button key={type} className={`${styles.insertBtn} ${styles['adm_' + type]}`} onMouseDown={noBlur} onClick={() => insertAdmonition(type, label)} title={`Infoga ${label.toLowerCase()}`}>
                  {label.charAt(0) + label.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
