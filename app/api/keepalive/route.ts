import { NextResponse } from 'next/server';
import { supabaseRead } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Daily keep-alive: free Supabase projects pause after ~7 days without use.
 * Called once a day by the Vercel cron in vercel.json. Runs one tiny read.
 * If CRON_SECRET is set in Vercel, only Vercel's cron (which sends it) can call this.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const db = supabaseRead();
  if (!db) return NextResponse.json({ ok: false, error: 'database not configured' }, { status: 503 });
  const { error } = await db.from('monitor_posts').select('slug').limit(1);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
