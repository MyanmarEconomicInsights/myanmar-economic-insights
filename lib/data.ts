import { CATEGORY_ORDER } from './categories';
import { demoIndicators, demoPosts } from './demo';
import { hasSupabase, supabaseRead } from './supabase';
import type { CategoryKey, Indicator, Post, Section } from './types';

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
