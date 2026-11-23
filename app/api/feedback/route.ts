import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabaseWrite } from '@/lib/supabase';

export const runtime = 'nodejs';

const KINDS = ['topic', 'error', 'other'];
const MAX_PER_HOUR = 5;

/**
 * Public "Suggest or correct" form. Stored in monitor_feedback, which has no public read access.
 * Spam guards: hidden honeypot field, minimum fill time, and at most 5 messages an hour per (hashed) IP.
 */
export async function POST(req: Request) {
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'Please try again.' }, { status: 400 }); }

  // Bots fill the hidden field or submit instantly: pretend success, store nothing.
  const elapsed = Date.now() - Number(b?.t ?? 0);
  if ((typeof b?.website === 'string' && b.website.trim()) || !(elapsed > 3000)) return NextResponse.json({ ok: true });

  const kind = KINDS.includes(b?.kind) ? b.kind : 'other';
  const message = typeof b?.message === 'string' ? b.message.trim() : '';
  const email = typeof b?.email === 'string' ? b.email.trim() : '';
  const post = typeof b?.post === 'string' && /^[a-z0-9-]{1,80}$/.test(b.post) ? b.post : null;
  if (message.length < 3) return NextResponse.json({ ok: false, error: 'Please write a short message.' }, { status: 400 });
  if (message.length > 4000) return NextResponse.json({ ok: false, error: 'Please keep the message under 4,000 characters.' }, { status: 400 });
  if (email && (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return NextResponse.json({ ok: false, error: 'That email address doesn’t look right (or leave it empty).' }, { status: 400 });
  }

  const db = supabaseWrite();
  if (!db) return NextResponse.json({ ok: false, error: 'The form is not available right now.' }, { status: 503 });

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const ipHash = createHash('sha256').update('mei-feedback:' + ip).digest('hex').slice(0, 32);
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await db.from('monitor_feedback').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since);
  if ((count ?? 0) >= MAX_PER_HOUR) return NextResponse.json({ ok: false, error: 'Too many messages for now. Please try again in an hour.' }, { status: 429 });

  const { error } = await db.from('monitor_feedback').insert({ kind, message, email: email || null, post_slug: post, ip_hash: ipHash });
  if (error) { console.error('feedback', error.message); return NextResponse.json({ ok: false, error: 'Could not send. Please try again later.' }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
