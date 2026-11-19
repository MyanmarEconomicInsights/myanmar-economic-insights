import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/auth';
import { CATEGORY_ORDER, isCategory } from '@/lib/categories';
import { supabaseWrite } from '@/lib/supabase';

export const runtime = 'nodejs';

const SLUG = /^[a-z0-9][a-z0-9-]{2,120}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

/**
 * Create or update a post (upsert by slug).
 * Header: Authorization: Bearer <POST_SECRET>
 * Body: { slug, kind: 'daily'|'weekly', title, dek?, body_md?, sections: [{category, value?, label?, text_md, source?}],
 *         sources?, period_start?, period_end?, published_at?, status? }
 * category ∈ prices | trade | business | money | conflict (at most one section per category).
 */
export async function POST(req: Request) {
  if (!isAuthorized(req)) return bad('unauthorized', 401);

  let b: any;
  try { b = await req.json(); } catch { return bad('body must be JSON'); }

  if (typeof b.slug !== 'string' || !SLUG.test(b.slug)) return bad('slug: lowercase letters, numbers and dashes');
  if (b.kind !== 'daily' && b.kind !== 'weekly') return bad("kind must be 'daily' or 'weekly'");
  if (typeof b.title !== 'string' || !b.title.trim() || b.title.length > 300) return bad('title required (max 300 chars)');
  if (b.body_md != null && (typeof b.body_md !== 'string' || b.body_md.length > 20_000)) return bad('body_md must be text (max 20,000 chars)');
  for (const k of ['period_start', 'period_end'] as const) {
    if (b[k] != null && !(typeof b[k] === 'string' && DATE.test(b[k]))) return bad(`${k} must be YYYY-MM-DD`);
  }
  const raw = Array.isArray(b.sections) ? b.sections : [];
  if (!raw.length) return bad(`sections required: one per category (${CATEGORY_ORDER.join(', ')})`);
  const seen = new Set<string>();
  const sections = [];
  for (const x of raw) {
    if (!isCategory(x?.category)) return bad(`section category must be one of ${CATEGORY_ORDER.join(', ')}`);
    if (seen.has(x.category)) return bad(`only one section per category (${x.category} repeated)`);
    seen.add(x.category);
    if (typeof x.text_md !== 'string' || !x.text_md.trim() || x.text_md.length > 5000) return bad(`${x.category}: text_md required (max 5,000 chars)`);
    for (const f of ['value', 'label', 'source'] as const) {
      if (x[f] != null && (typeof x[f] !== 'string' || x[f].length > 300)) return bad(`${x.category}: ${f} must be short text`);
    }
    if (x.value && !x.source) return bad(`${x.category}: a headline number needs a source`);
    sections.push({ category: x.category, value: x.value ?? undefined, label: x.label ?? undefined, text_md: x.text_md, source: x.source ?? undefined });
  }
  sections.sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));
  const sources = Array.isArray(b.sources) ? b.sources.slice(0, 50) : [];

  const row = {
    slug: b.slug,
    kind: b.kind,
    title: b.title.trim(),
    dek: typeof b.dek === 'string' ? b.dek.slice(0, 500) : null,
    body_md: b.body_md ?? '',
    sections,
    sources,
    period_start: b.period_start ?? null,
    period_end: b.period_end ?? null,
    status: b.status === 'draft' ? 'draft' : 'published',
    ...(b.published_at ? { published_at: b.published_at } : {}),
  };

  const db = supabaseWrite();
  if (!db) return bad('database not configured', 503);
  const { data, error } = await db.from('monitor_posts').upsert(row, { onConflict: 'slug' }).select('slug,kind').single();
  if (error) return bad(error.message, 500);

  revalidatePath('/');
  revalidatePath(`/${data.kind}`);
  for (const s of sections) revalidatePath(`/c/${s.category}`);
  revalidatePath(`/p/${data.slug}`);
  return NextResponse.json({ ok: true, slug: data.slug, url: `/p/${data.slug}` });
}
