import { CATEGORY_ORDER } from './categories';
import { demoIndicators, demoPosts, demoStatus } from './demo';
import { HIGHLIGHTS } from './highlights';
import { getLang } from './i18n';
import { hasSupabase, supabaseRead } from './supabase';
import type { CategoryKey, Indicator, Post, Section, StatusItem } from './types';

const POST_COLS = 'slug,kind,title,dek,body_md,sections,sources,period_start,period_end,published_at';
const IND_COLS = 'key,category,label,value,unit,location,observed_on,source,source_url,note';

export const isDemo = !hasSupabase;

/* ---------- Burmese translations (table monitor_i18n; Beta, Nov 2026) ---------- */

type TrData = Record<string, unknown> & { sections?: { category: string; value?: string; label?: string; text_md?: string }[] };

/** Translations for the current language (only Burmese is stored). Empty map for English or on any error. */
async function trMap(kind: 'post' | 'status', refs: string[]): Promise<Map<string, TrData>> {
  if (!refs.length || (await getLang()) !== 'my') return new Map();
  const db = supabaseRead();
  if (!db) return new Map();
  const { data, error } = await db.from('monitor_i18n').select('ref,data').eq('kind', kind).eq('lang', 'my').in('ref', refs);
  if (error) { console.error('monitor_i18n', error.message); return new Map(); }
  return new Map(((data ?? []) as { ref: string; data: TrData }[]).map((r) => [r.ref, r.data]));
}

const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);

/** Overlay Burmese title, dek and section text; numbers, sources and links stay as published. Sets `translated`. */
async function trPosts(posts: Post[]): Promise<Post[]> {
  const m = await trMap('post', posts.map((p) => p.slug));
  if (!m.size) return posts;
  return posts.map((p) => {
    const t = m.get(p.slug);
    if (!t) return p;
    return {
      ...p, title: str(t.title) ?? p.title, dek: str(t.dek) ?? p.dek, translated: true,
      sections: p.sections.map((s) => {
        const ts = t.sections?.find((x) => x.category === s.category);
        return ts ? { ...s, value: ts.value || s.value, label: ts.label || s.label, text_md: ts.text_md || s.text_md } : s;
      }),
    } as Post;
  });
}

async function trStatus(rows: StatusItem[]): Promise<StatusItem[]> {
  const m = await trMap('status', rows.map((r) => `${r.board}|${r.name}`));
  if (!m.size) return rows;
  return rows.map((r) => {
    const t = m.get(`${r.board}|${r.name}`);
    return t ? { ...r, name_en: r.name, name: str(t.name) ?? r.name, place: str(t.place) ?? r.place, status: str(t.status) ?? r.status, note: str(t.note) ?? r.note } as StatusItem : r;
  });
}

/** Status text for given status-board rows, in the current language (used by the route panel). */
export async function statusText(board: StatusItem['board'], names: string[]): Promise<Map<string, { name?: string; status?: string }>> {
  const m = await trMap('status', names.map((n) => `${board}|${n}`));
  return new Map([...m.entries()].map(([k, v]) => [k.slice(board.length + 1), { name: str(v.name), status: str(v.status) }]));
}

const norm = (p: Post): Post => ({ ...p, sections: Array.isArray(p.sections) ? p.sections : [], sources: Array.isArray(p.sources) ? p.sources : [] });

export async function getPosts(kind?: 'daily' | 'weekly', limit = 20): Promise<Post[]> {
  const db = supabaseRead();
  if (!db) {
    return demoPosts.filter((p) => !kind || p.kind === kind)
      .sort(newestPost).slice(0, limit);
  }
  let q = db.from('monitor_posts').select(POST_COLS)
    .order('period_end', { ascending: false, nullsFirst: false }).order('published_at', { ascending: false }).limit(limit);
  if (kind) q = q.eq('kind', kind);
  const { data, error } = await q;
  if (error) { console.error('getPosts', error.message); return []; }
  return trPosts(((data ?? []) as Post[]).map(norm).sort(newestPost));
}

/** Newest first: by the last day a post covers, then by when it was published. */
const postDate = (p: Post) => p.period_end ?? p.published_at.slice(0, 10);
function newestPost(a: Post, b: Post) {
  return postDate(b).localeCompare(postDate(a)) || b.published_at.localeCompare(a.published_at);
}

export async function getPost(slug: string): Promise<Post | null> {
  const db = supabaseRead();
  if (!db) return demoPosts.find((p) => p.slug === slug) ?? null;
  const { data, error } = await db.from('monitor_posts').select(POST_COLS).eq('slug', slug).maybeSingle();
  if (error) { console.error('getPost', error.message); return null; }
  return data ? (await trPosts([norm(data as Post)]))[0] : null;
}

export type SectionEntry = Section & { post: Pick<Post, 'slug' | 'kind' | 'title' | 'period_start' | 'period_end' | 'published_at'> };

/** Every category section from recent posts, newest first. */
export async function getSectionEntries(limitPosts = 120): Promise<SectionEntry[]> {
  const posts = await getPosts(undefined, limitPosts);
  return posts.flatMap((p) => p.sections.map((s) => ({
    ...s, post: { slug: p.slug, kind: p.kind, title: p.title, period_start: p.period_start, period_end: p.period_end, published_at: p.published_at },
  })));
}

/** The most recent section for each of the five categories. */
export async function getLatestByCategory(): Promise<Record<CategoryKey, SectionEntry | undefined>> {
  const entries = await getSectionEntries(40);
  const out = {} as Record<CategoryKey, SectionEntry | undefined>;
  for (const k of CATEGORY_ORDER) out[k] = entries.find((e) => e.category === k);
  return out;
}

export async function getIndicatorSeries(key: string, location = '', limit = 60): Promise<Indicator[]> {
  const db = supabaseRead();
  if (!db) {
    return demoIndicators.filter((i) => i.key === key && i.location === location)
      .sort((a, b) => a.observed_on.localeCompare(b.observed_on));
  }
  const { data, error } = await db.from('monitor_indicators').select(IND_COLS)
    .eq('key', key).eq('location', location).order('observed_on', { ascending: false }).limit(limit);
  if (error) { console.error('getIndicatorSeries', error.message); return []; }
  return ((data ?? []) as Indicator[]).map((r) => ({ ...r, value: Number(r.value) })).reverse();
}

/** Latest value of each tracked item (key + location) in a category. */
export async function getLatestIndicators(category: CategoryKey): Promise<Indicator[]> {
  const db = supabaseRead();
  let rows: Indicator[];
  if (!db) {
    rows = demoIndicators.filter((i) => i.category === category);
  } else {
    const { data, error } = await db.from('monitor_indicators').select(IND_COLS)
      .eq('category', category).order('observed_on', { ascending: false }).limit(500);
    if (error) { console.error('getLatestIndicators', error.message); return []; }
    rows = ((data ?? []) as Indicator[]).map((r) => ({ ...r, value: Number(r.value) }));
  }
  const seen = new Map<string, Indicator>();
  for (const r of [...rows].sort((a, b) => b.observed_on.localeCompare(a.observed_on))) {
    const id = `${r.key}|${r.location}`;
    if (!seen.has(id)) seen.set(id, r);
  }
  return [...seen.values()].sort((a, b) => b.observed_on.localeCompare(a.observed_on) || a.label.localeCompare(b.label) || a.location.localeCompare(b.location));
}

/** All indicator observations, newest first (for the public data explorer). */
export async function getAllIndicators(limit = 5000): Promise<Indicator[]> {
  const db = supabaseRead();
  if (!db) return [...demoIndicators].sort((a, b) => b.observed_on.localeCompare(a.observed_on));
  const out: Indicator[] = [];
  // Supabase returns max 1,000 rows per request, so page through.
  for (let from = 0; from < limit; from += 1000) {
    const { data, error } = await db.from('monitor_indicators').select(IND_COLS)
      .order('observed_on', { ascending: false }).order('key').range(from, Math.min(from + 999, limit - 1));
    if (error) { console.error('getAllIndicators', error.message); break; }
    out.push(...((data ?? []) as Indicator[]).map((r) => ({ ...r, value: Number(r.value) })));
    if (!data || data.length < 1000) break;
  }
  return out;
}

/** Status boards (trade routes, pressure points), newest first by as_of (the row's latest source date). */
export async function getStatus(board: StatusItem['board']): Promise<StatusItem[]> {
  const db = supabaseRead();
  let rows: StatusItem[];
  if (!db) rows = demoStatus.filter((s) => s.board === board);
  else {
    const { data, error } = await db.from('monitor_status')
      .select('board,name,place,status,level,note,source,source_url,as_of,sort').eq('board', board);
    if (error) { console.error('getStatus', error.message); return []; }
    rows = (data ?? []) as StatusItem[];
  }
  rows.sort((a, b) => b.as_of.localeCompare(a.as_of) || (a.sort ?? 99) - (b.sort ?? 99) || a.name.localeCompare(b.name));
  return trStatus(rows);
}

export interface Tile {
  label: string; value: string; unit: string; date: string; source: string;
  change?: { pct: number; since: string; bad: boolean }; sub?: string;
}

const UNIT_SHORT: Record<string, string> = {
  'MMK per USD': '', 'MMK per viss': 'a viss', 'MMK per litre': 'a litre', 'MMK per sack': 'a sack',
  'MMK per bag': 'a bag', 'MMK per basket': 'a basket', 'MMK per egg': 'each', 'MMK per tical': 'a tical',
};

/** Compact display of a figure: K4,760 · K10tn · $5.6B · 70% · or the range written in the note. */
export function formatFigure(i: Pick<Indicator, 'value' | 'unit' | 'note'>): { value: string; unit: string; rest?: string } {
  const range = i.note?.match(/^range (K[\d,]+[–-][\d,]+)\s*;?\s*(.*)$/);
  const over = i.note?.match(/^(?:over|K[\d,]+\+)/);
  const n = i.value.toLocaleString('en-US');
  let value: string;
  switch (i.unit) {
    case 'MMK trillion': value = `K${n}tn`; break;
    case 'USD billion': value = `$${n}B`; break;
    case 'USD million': value = `$${n}M`; break;
    case '%': value = `${n}%`; break;
    case 'THB': value = `${n} baht`; break;
    default: value = i.unit?.startsWith('MMK') ? `K${n}` : n;
  }
  if (range) return { value: range[1], unit: UNIT_SHORT[i.unit ?? ''] ?? '', rest: range[2] || undefined };
  if (over) value = `>${value}`;
  return { value, unit: UNIT_SHORT[i.unit ?? ''] ?? (i.unit ?? '') };
}

export interface Highlight {
  label: string; short?: string; value: string; date: string; source: string;
  change?: { pct: number; since: string; bad: boolean }; sub?: string;
  level?: StatusItem['level'];
}

/** Key indicators: for each area, its configured highlight figures (latest value, change, source). */
export async function getHighlights(): Promise<Record<CategoryKey, Highlight[]>> {
  const out = {} as Record<CategoryKey, Highlight[]>;
  const boards = { trade: await getStatus('trade'), hotspot: await getStatus('hotspot') };
  for (const cat of CATEGORY_ORDER) {
    const items: Highlight[] = [];
    for (const h of HIGHLIGHTS[cat]) {
      if (h.kind === 'latest') {
        const rows = [...boards[h.board]].sort((a, b) => b.as_of.localeCompare(a.as_of) || (a.sort ?? 99) - (b.sort ?? 99)).slice(0, h.count);
        for (const s of rows) items.push({ label: s.name, value: s.status, date: '', source: s.source, sub: s.note ?? undefined, level: s.level });
        continue;
      }
      if (h.kind === 'status') {
        const s = boards[h.board].find((x) => x.name === h.name || (x as StatusItem & { name_en?: string }).name_en === h.name);
        if (s) items.push({ label: s.name, value: s.status, date: '', source: s.source, sub: s.note ?? undefined, level: s.level });
        continue;
      }
      const series = await getIndicatorSeries(h.key, h.location ?? '');
      const last = series.at(-1);
      if (!last) continue;
      const first = series[0];
      const f = formatFigure(last);
      const item: Highlight = { label: h.label, short: h.short, value: f.value, date: last.observed_on, source: last.source };
      if (first && first !== last && first.value) {
        const pct = ((last.value - first.value) / first.value) * 100;
        item.change = { pct, since: first.observed_on, bad: h.upIsBad ? pct > 0 : pct < 0 };
      } else if (f.rest) item.sub = f.rest;
      else if (last.note && !/^(over|K[\d,]+\+|range)/.test(last.note)) item.sub = last.note;
      items.push(item);
    }
    out[cat] = items.slice(0, 3);
  }
  return out;
}

/** One point per ISO week: the last observation of that week (for week-by-week charts). */
export async function getWeeklySeries(key: string, location = ''): Promise<{ week: string; d: string; v: number }[]> {
  const s = await getIndicatorSeries(key, location, 400);
  const byWeek = new Map<string, Indicator>();
  for (const r of s) byWeek.set(isoWeek(r.observed_on), r);
  return [...byWeek.entries()].map(([week, r]) => ({ week, d: r.observed_on, v: r.value }));
}

function isoWeek(d: string): string {
  const dt = new Date(d + 'T00:00:00Z');
  const day = (dt.getUTCDay() + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - day + 3);
  const firstThu = new Date(Date.UTC(dt.getUTCFullYear(), 0, 4));
  const wk = 1 + Math.round(((dt.getTime() - firstThu.getTime()) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  return `W${wk}`;
}

/* ---------- Days (Myanmar time) ---------- */

/** Today's date in Myanmar time (UTC+6:30), YYYY-MM-DD. */
export const mmtToday = () => new Date(Date.now() + 6.5 * 3600_000).toISOString().slice(0, 10);

const addDays = (d: string, n: number) => {
  const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10);
};

/** Days that have something to show: a daily post (strong), or a weekly issue / tracked figure (light). */
export async function getContentDays(): Promise<{ daily: string[]; other: string[] }> {
  const posts = await getPosts(undefined, 400);
  const daily = new Set<string>();
  const other = new Set<string>();
  for (const p of posts) {
    const end = p.period_end ?? p.published_at.slice(0, 10);
    if (p.kind === 'daily') { daily.add(end); continue; }
    let d = p.period_start ?? end;
    for (let i = 0; d <= end && i < 31; i++, d = addDays(d, 1)) other.add(d);
  }
  const db = supabaseRead();
  if (db) {
    const { data } = await db.from('monitor_indicators').select('observed_on').gte('observed_on', '2026-01-01').limit(5000);
    for (const r of (data ?? []) as { observed_on: string }[]) other.add(r.observed_on);
  } else for (const i of demoIndicators) other.add(i.observed_on);
  for (const d of daily) other.delete(d);
  return { daily: [...daily].sort(), other: [...other].sort() };
}

/** Everything dated to one Myanmar-time day: posts covering it, figures observed on it, status updates. */
export async function getDay(date: string): Promise<{ posts: Post[]; indicators: Indicator[]; status: StatusItem[] }> {
  const db = supabaseRead();
  if (!db) {
    const posts = demoPosts.filter((p) => (p.period_start ?? p.published_at.slice(0, 10)) <= date && (p.period_end ?? p.published_at.slice(0, 10)) >= date);
    return { posts, indicators: demoIndicators.filter((i) => i.observed_on === date), status: demoStatus.filter((s) => s.as_of === date) };
  }
  const [p, i, s] = await Promise.all([
    db.from('monitor_posts').select(POST_COLS).lte('period_start', date).gte('period_end', date).order('kind').limit(20),
    db.from('monitor_indicators').select(IND_COLS).eq('observed_on', date).order('category').order('label').limit(500),
    db.from('monitor_status').select('board,name,place,status,level,note,source,source_url,as_of,sort').eq('as_of', date),
  ]);
  if (p.error) console.error('getDay posts', p.error.message);
  const posts = await trPosts(((p.data ?? []) as Post[]).map(norm).sort((a, b) => (a.kind === b.kind ? newestPost(a, b) : a.kind === 'daily' ? -1 : 1)));
  return {
    posts,
    indicators: ((i.data ?? []) as Indicator[]).map((r) => ({ ...r, value: Number(r.value) })),
    status: ((s.data ?? []) as StatusItem[]).sort((a, b) => (a.sort ?? 99) - (b.sort ?? 99) || a.name.localeCompare(b.name)),
  };
}
