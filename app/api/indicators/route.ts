import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/auth';
import { isCategory } from '@/lib/categories';
import { supabaseWrite } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * Add or correct indicator observations (upsert on key + location + date).
 * Header: Authorization: Bearer <POST_SECRET>
 * Body: { observations: [{ key, category, label, value, unit?, location?, observed_on, source, source_url?, note? }] }
 * category ∈ prices | trade | business | money | conflict
 * Every observation must name a source.
 */
export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'body must be JSON' }, { status: 400 }); }
  const obs = Array.isArray(b?.observations) ? b.observations : [];
  if (!obs.length || obs.length > 200) return NextResponse.json({ ok: false, error: '1–200 observations required' }, { status: 400 });

  const rows = [];
  for (const o of obs) {
    const value = Number(o?.value);
    if (typeof o?.key !== 'string' || !/^[a-z0-9_]{2,60}$/.test(o.key) || typeof o.label !== 'string'
      || !Number.isFinite(value) || !/^\d{4}-\d{2}-\d{2}$/.test(o.observed_on ?? '')
      || typeof o.source !== 'string' || !o.source.trim() || !isCategory(o.category)) {
      return NextResponse.json({ ok: false, error: 'each observation needs key, category, label, numeric value, observed_on (YYYY-MM-DD) and source', bad: o }, { status: 400 });
    }
    rows.push({
      key: o.key, category: o.category, label: o.label, value, unit: o.unit ?? null, location: o.location ?? '',
      observed_on: o.observed_on, source: o.source.trim(), source_url: o.source_url ?? null, note: o.note ?? null,
    });
  }

  const db = supabaseWrite();
  if (!db) return NextResponse.json({ ok: false, error: 'database not configured' }, { status: 503 });
  const { error } = await db.from('monitor_indicators').upsert(rows, { onConflict: 'key,location,observed_on' });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  revalidatePath('/');
  for (const c of new Set(rows.map((r) => r.category))) revalidatePath(`/c/${c}`);
  return NextResponse.json({ ok: true, saved: rows.length });
}
