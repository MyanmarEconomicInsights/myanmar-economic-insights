'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories';
import type { CategoryKey, Indicator } from '@/lib/types';

export type UpdateRow = {
  category: CategoryKey; value: string; label: string; text: string; source: string;
  date: string; kind: 'daily' | 'weekly'; slug: string;
};

type Tab = 'figures' | 'updates';
type Dir = 'asc' | 'desc';
const PAGE = 50;

const fmtDate = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const plain = (md: string) => md.replace(/[*_`#>]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

function csvEsc(v: unknown) {
  const s = v == null ? '' : String(v);
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}
function download(name: string, header: string[], rows: unknown[][]) {
  const csv = [header.join(','), ...rows.map((r) => r.map(csvEsc).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DataExplorer({ figures, updates }: { figures: Indicator[]; updates: UpdateRow[] }) {
  const [tab, setTab] = useState<Tab>('figures');
  const [q, setQ] = useState('');
  const [cats, setCats] = useState<CategoryKey[]>([]);
  const [item, setItem] = useState('');
  const [place, setPlace] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState<{ col: string; dir: Dir }>({ col: 'date', dir: 'desc' });
  const [shown, setShown] = useState(PAGE);

  // Filters live in the URL so a filtered view can be bookmarked or shared.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('tab') === 'updates') setTab('updates');
    setQ(p.get('q') ?? '');
    setCats((p.get('cat') ?? '').split(',').filter((c): c is CategoryKey => CATEGORY_ORDER.includes(c as CategoryKey)));
    setItem(p.get('item') ?? ''); setPlace(p.get('place') ?? '');
    setFrom(p.get('from') ?? ''); setTo(p.get('to') ?? '');
  }, []);
  useEffect(() => {
    const p = new URLSearchParams();
    if (tab !== 'figures') p.set('tab', tab);
    if (q) p.set('q', q); if (cats.length) p.set('cat', cats.join(','));
    if (item) p.set('item', item); if (place) p.set('place', place);
    if (from) p.set('from', from); if (to) p.set('to', to);
    const s = p.toString();
    window.history.replaceState(null, '', s ? `?${s}` : window.location.pathname);
    setShown(PAGE);
  }, [tab, q, cats, item, place, from, to]);

  const inCats = (c: CategoryKey | null) => !cats.length || (c != null && cats.includes(c));
  const inDates = (d: string) => (!from || d >= from) && (!to || d <= to);
  const needle = q.trim().toLowerCase();

  const items = useMemo(() => [...new Set(figures.filter((f) => inCats(f.category)).map((f) => f.label))].sort(), [figures, cats]);
  const places = useMemo(() => [...new Set(figures.filter((f) => inCats(f.category) && (!item || f.label === item)).map((f) => f.location || 'National'))].sort(), [figures, cats, item]);

  const figRows = useMemo(() => {
    const rows = figures.filter((f) => inCats(f.category) && inDates(f.observed_on)
      && (!item || f.label === item) && (!place || (f.location || 'National') === place)
      && (!needle || `${f.label} ${f.location} ${f.source} ${f.note ?? ''} ${f.unit ?? ''}`.toLowerCase().includes(needle)));
    const key = (f: Indicator): string | number => ({
      date: f.observed_on, category: f.category ? CATEGORY_ORDER.indexOf(f.category) : 9, item: f.label,
      place: f.location || 'National', value: f.value, source: f.source,
    } as Record<string, string | number>)[sort.col] ?? f.observed_on;
    return rows.sort((a, b) => {
      const x = key(a), y = key(b);
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      return (sort.dir === 'asc' ? c : -c) || b.observed_on.localeCompare(a.observed_on);
    });
  }, [figures, cats, item, place, from, to, needle, sort]);

  const updRows = useMemo(() => {
    const rows = updates.filter((u) => inCats(u.category) && inDates(u.date)
      && (!needle || `${u.value} ${u.label} ${u.text} ${u.source}`.toLowerCase().includes(needle)));
    const key = (u: UpdateRow) => ({ date: u.date, category: String(CATEGORY_ORDER.indexOf(u.category)), item: u.label, source: u.source } as Record<string, string>)[sort.col] ?? u.date;
    return rows.sort((a, b) => { const c = key(a).localeCompare(key(b)); return (sort.dir === 'asc' ? c : -c) || b.date.localeCompare(a.date); });
  }, [updates, cats, from, to, needle, sort]);

  const total = tab === 'figures' ? figRows.length : updRows.length;
  const anyFilter = q || cats.length || item || place || from || to;

  function Th({ col, children, num }: { col: string; children: React.ReactNode; num?: boolean }) {
    const active = sort.col === col;
    return (
      <th className={num ? 'num' : undefined} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button type="button" className="sortbtn" onClick={() => setSort({ col, dir: active && sort.dir === 'desc' ? 'asc' : 'desc' })}>
          {children}<span aria-hidden>{active ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ' ↕'}</span>
        </button>
      </th>
    );
  }

  function exportCsv() {
    const day = new Date().toISOString().slice(0, 10);
    if (tab === 'figures') {
      download(`figures-${day}.csv`, ['date', 'category', 'item', 'location', 'value', 'unit', 'source', 'source_url', 'note'],
        figRows.map((f) => [f.observed_on, f.category ? CATEGORIES[f.category].name : '', f.label, f.location || 'National', f.value, f.unit, f.source, f.source_url, f.note]));
    } else {
      download(`updates-${day}.csv`, ['date', 'type', 'category', 'number', 'what it means', 'text', 'source', 'link'],
        updRows.map((u) => [u.date, u.kind, CATEGORIES[u.category].name, u.value, u.label, plain(u.text), u.source, `${location.origin}/p/${u.slug}`]));
    }
  }

  return (
    <div className="explorer">
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'figures'} onClick={() => { setTab('figures'); setSort({ col: 'date', dir: 'desc' }); }}>Figures <span>{figures.length}</span></button>
        <button role="tab" aria-selected={tab === 'updates'} onClick={() => { setTab('updates'); setSort({ col: 'date', dir: 'desc' }); }}>Updates <span>{updates.length}</span></button>
      </div>

      <div className="panel filters">
        <input type="search" placeholder={tab === 'figures' ? 'Search items, places, sources…' : 'Search updates…'} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <div className="chips" role="group" aria-label="Category">
          {CATEGORY_ORDER.map((k) => {
            const on = cats.includes(k);
            return (
              <button key={k} type="button" aria-pressed={on} className={on ? 'chip on' : 'chip'}
                onClick={() => { setCats(on ? cats.filter((c) => c !== k) : [...cats, k]); setItem(''); setPlace(''); }}>
                <span className="sw" style={{ background: `var(--cat-${k})` }} aria-hidden />{CATEGORIES[k].short}
              </button>
            );
          })}
        </div>
        <div className="row">
          {tab === 'figures' && (
            <>
              <label>Item<select value={item} onChange={(e) => { setItem(e.target.value); setPlace(''); }}><option value="">All items</option>{items.map((i) => <option key={i}>{i}</option>)}</select></label>
              <label>Place<select value={place} onChange={(e) => setPlace(e.target.value)}><option value="">All places</option>{places.map((p) => <option key={p}>{p}</option>)}</select></label>
            </>
          )}
          <label>From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label>To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
          {anyFilter && <button type="button" className="linkbtn" onClick={() => { setQ(''); setCats([]); setItem(''); setPlace(''); setFrom(''); setTo(''); }}>Clear filters</button>}
        </div>
      </div>

      <div className="resultbar">
        <span>{total.toLocaleString('en-US')} {tab === 'figures' ? 'figures' : 'updates'}</span>
        <span>
          <button type="button" className="btn" onClick={exportCsv} disabled={!total}>Download these rows (CSV)</button>
          {tab === 'figures' && <a className="linkbtn" href="/api/data?format=csv">Full dataset</a>}
        </span>
      </div>

      <div className="panel table-wrap">
        {tab === 'figures' ? (
          <table className="ind data">
            <thead><tr>
              <Th col="date">Date</Th><Th col="category">Area</Th><Th col="item">Item</Th><Th col="place">Place</Th>
              <Th col="value" num>Value</Th><th>Unit</th><Th col="source">Source</Th>
            </tr></thead>
            <tbody>
              {figRows.slice(0, shown).map((f) => (
                <tr key={f.key + f.location + f.observed_on}>
                  <td>{fmtDate(f.observed_on)}</td>
                  <td>{f.category && <span className="cat"><span className="sw" style={{ background: `var(--cat-${f.category})` }} aria-hidden />{CATEGORIES[f.category].short}</span>}</td>
                  <td>{f.label}</td><td>{f.location || 'National'}</td>
                  <td className="num">{f.value.toLocaleString('en-US')}</td><td>{f.unit}</td>
                  <td>{f.source_url ? <a href={f.source_url} target="_blank" rel="noopener noreferrer">{f.source}</a> : f.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="ind data">
            <thead><tr><Th col="date">Date</Th><Th col="category">Area</Th><Th col="item">Headline</Th><th>Update</th><Th col="source">Source</Th></tr></thead>
            <tbody>
              {updRows.slice(0, shown).map((u) => (
                <tr key={u.slug + u.category}>
                  <td>{fmtDate(u.date)}<div className="kicker">{u.kind === 'weekly' ? 'Weekly' : 'Daily'}</div></td>
                  <td><span className="cat"><span className="sw" style={{ background: `var(--cat-${u.category})` }} aria-hidden />{CATEGORIES[u.category].short}</span></td>
                  <td className="wrapcell"><b>{u.value}</b> {u.label}</td>
                  <td className="wrapcell">{plain(u.text)} <Link href={`/p/${u.slug}`}>Read →</Link></td>
                  <td className="wrapcell">{u.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!total && <p className="kicker" style={{ padding: 12 }}>Nothing matches these filters.</p>}
        {total > shown && <button type="button" className="btn more-btn" onClick={() => setShown(shown + PAGE)}>Show {Math.min(PAGE, total - shown)} more</button>}
      </div>
      <p className="note">
        For automatic daily access, use <code>/api/data?format=csv</code> or <code>?format=json</code>. You can filter with
        <code> category</code>, <code>key</code>, <code>location</code>, <code>from</code> and <code>to</code>, for example <code>/api/data?format=json&amp;category=prices&amp;from=2026-11-01</code>.
      </p>
    </div>
  );
}
