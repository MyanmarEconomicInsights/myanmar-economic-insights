import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/auth';
import { supabaseWrite } from '@/lib/supabase';

export const runtime = 'nodejs';

const LEVELS = ['open', 'restricted', 'serious', 'closed'];

/**
 * Add or update rows on the status boards (upsert on board + name).
 * Header: Authorization: Bearer <POST_SECRET>
 * Body: { items: [{ board: 'trade'|'hotspot', name, place, status, level: open|restricted|serious|closed, note?, source, as_of: 'YYYY-MM-DD', sort? }],
 *         remove?: [{ board, name }] }
 */
export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'body must be JSON' }, { status: 400 }); }
  const items = Array.isArray(b?.items) ? b.items : [];
  const remove = Array.isArray(b?.remove) ? b.remove : [];
  if (!items.length && !remove.length) return NextResponse.json({ ok: false, error: 'items or remove required' }, { status: 400 });
  for (const i of items) {
    if (!['trade', 'hotspot'].includes(i?.board) || typeof i.name !== 'string' || typeof i.status !== 'string'
      || !LEVELS.includes(i.level) || typeof i.source !== 'string' || !i.source.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(i.as_of ?? '')) {
      return NextResponse.json({ ok: false, error: 'each item needs board, name, status, level, source and as_of', bad: i }, { status: 400 });
    }
  }
  const db = supabaseWrite();
  if (!db) return NextResponse.json({ ok: false, error: 'database not configured' }, { status: 503 });
  if (items.length) {
    const rows = items.map((i: any) => ({ board: i.board, name: i.name, place: i.place ?? '', status: i.status, level: i.level,
      note: i.note ?? null, source: i.source.trim(), as_of: i.as_of, sort: Number.isFinite(i.sort) ? i.sort : 99 }));
    const { error } = await db.from('monitor_status').upsert(rows, { onConflict: 'board,name' });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  for (const r of remove) {
    const { error } = await db.from('monitor_status').delete().eq('board', r.board).eq('name', r.name);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  revalidatePath('/');
  return NextResponse.json({ ok: true, saved: items.length, removed: remove.length });
}
