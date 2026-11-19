import { CATEGORY_ORDER } from './categories';
import { demoIndicators, demoPosts, demoStatus } from './demo';
import { HOME_TILES } from './highlights';
import { hasSupabase, supabaseRead } from './supabase';
import type { CategoryKey, Indicator, Post, Section, StatusItem } from './types';

const POST_COLS = 'slug,kind,title,dek,body_md,sections,sources,period_start,period_end,published_at';
const IND_COLS = 'key,category,label,value,unit,location,observed_on,source,source_url,note';

export const isDemo = !hasSupabase;

const norm = (p: Post): Post => ({ ...p, sections: Array.isArray(p.sections) ? p.sections : [], sources: Array.isArray(p.sources) ? p.sources : [] });

export async function getPosts(kind?: 'daily' | 'weekly', limit = 20): Promise<Post[]> {
  const db = supabaseRead();
  if (!db) {
    return demoPosts.filter((p) => !kind || p.kind === kind)
      .sort((a, b) => b.published_at.localeCompare(a.published_at)).slice(0, limit);
  }
  let q = db.from('monitor_posts').select(POST_COLS).order('published_at', { ascending: false }).limit(limit);
  if (kind) q = q.eq('kind', kind);
  const { data, error } = await q;
  if (error) { console.error('getPosts', error.message); return []; }
  return ((data ?? []) as Post[]).map(norm);
}

export async function getPost(slug: string): Promise<Post | null> {
  const db = supabaseRead();
  if (!db) return demoPosts.find((p) => p.slug === slug) ?? null;
  const { data, error } = await db.from('monitor_posts').select(POST_COLS).eq('slug', slug).maybeSingle();
  if (error) { console.error('getPost', error.message); return null; }
  return data ? norm(data as Post) : null;
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
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label) || a.location.localeCompare(b.location));
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

/** Status boards (trade routes, pressure points), ordered for display. */
export async function getStatus(board: StatusItem['board']): Promise<StatusItem[]> {
  const db = supabaseRead();
  let rows: StatusItem[];
  if (!db) rows = demoStatus.filter((s) => s.board === board);
  else {
    const { data, error } = await db.from('monitor_status')
      .select('board,name,place,status,level,note,source,as_of,sort').eq('board', board);
    if (error) { console.error('getStatus', error.message); return []; }
    rows = (data ?? []) as StatusItem[];
  }
  return rows.sort((a, b) => (a.sort ?? 99) - (b.sort ?? 99) || a.name.localeCompare(b.name));
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
    case '%': value = `${n}%`; break;
    case 'THB': value = `${n} baht`; break;
    default: value = i.unit?.startsWith('MMK') ? `K${n}` : n;
  }
  if (range) return { value: range[1], unit: UNIT_SHORT[i.unit ?? ''] ?? '', rest: range[2] || undefined };
  if (over) value = `>${value}`;
  return { value, unit: UNIT_SHORT[i.unit ?? ''] ?? (i.unit ?? '') };
}

/** Key-indicator tiles: latest value of each configured item, with change since its earliest observation. */
export async function getTiles(): Promise<Tile[]> {
  const out: Tile[] = [];
  for (const t of HOME_TILES) {
    const series = await getIndicatorSeries(t.key, t.location ?? '');
    const last = series.at(-1);
    if (!last) continue;
    const first = series[0];
    const f = formatFigure(last);
    const tile: Tile = { label: t.label, value: f.value, unit: f.unit, date: last.observed_on, source: last.source };
    if (first && first !== last && first.value) {
      const pct = ((last.value - first.value) / first.value) * 100;
      tile.change = { pct, since: first.observed_on, bad: t.upIsBad ? pct > 0 : pct < 0 };
    } else if (f.rest) tile.sub = f.rest;
    else if (last.note && !/^(over|K[\d,]+\+)/.test(last.note)) tile.sub = last.note;
    out.push(tile);
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
