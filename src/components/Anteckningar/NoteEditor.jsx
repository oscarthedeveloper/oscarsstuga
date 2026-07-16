import React, { useState, useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import { marked } from 'marked';
import { Trash2 } from '@site/src/components/HP/icons';
import { useSyncedState } from '@site/src/lib/useSyncedState';
import styles from './notes.module.css';

// Markdown → HTML (migrering av gamla anteckningar sparade som markdown)
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
  const editorRef = useRef(null);
  const loadedIdRef = useRef(null);
  const saveTimer = useRef(null);

  const note = notes.find((n) => n.id === id) || null;

  // Läs rubriker (h1–h4) ur editorn, ge dem id:n och bygg innehållsförteckningen
  function buildToc() {
    const el = editorRef.current;
    if (!el) return;
    const heads = el.querySelectorAll('h1, h2, h3, h4');
    const items = [];
    const seen = {};
    heads.forEach((h, i) => {
      const text = h.textContent.trim();
      if (!text) return;
      let base = slugify(text) || 'rubrik';
      let hid = base;
      let k = 1;
      while (seen[hid]) hid = `${base}-${k++}`;
      seen[hid] = true;
      h.id = hid;
      items.push({ id: hid, text, level: Number(h.tagName[1]) });
    });
    setToc(items);
  }

  // Ladda innehåll så snart BÅDE noten och editor-elementet finns (keyed på id)
  useEffect(() => {
    const el = editorRef.current;
    if (!note || !el) return;
    if (loadedIdRef.current === note.id) return;
    el.innerHTML = contentOf(note);
    setTitle(note.title || '');
    loadedIdRef.current = note.id;
    buildToc();
  });

  // Aktiv rubrik vid scroll
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

  // ── Hjälpare för markdown-genvägar ─────────────────────────────
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
    const before = probe.toString().replace(/ /g, ' ').trim();

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

  return (
    <div className={styles.wrap}>
      <div className={styles.pageLayout}>
        <div className={styles.main}>
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
            onBlur={saveNow}
          />
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
        </aside>
      </div>
    </div>
  );
}
