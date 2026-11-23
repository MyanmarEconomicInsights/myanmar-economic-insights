'use client';
import { useState } from 'react';

export default function FeedbackForm({ kind = 'topic', post = '' }: { kind?: string; post?: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [err, setErr] = useState('');
  const [t] = useState(() => Date.now());

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(''); setState('sending');
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: f.get('kind'), message: f.get('message'), email: f.get('email'), website: f.get('website'), post, t }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) { setErr(j.error ?? 'Could not send. Please try again later.'); setState('idle'); return; }
      setState('sent');
    } catch { setErr('Could not send. Please check your connection and try again.'); setState('idle'); }
  }

  if (state === 'sent') return <p className="fb-ok" role="status">Thank you. Your message was received and will be read by the editors.</p>;

  return (
    <form className="fb-form" onSubmit={submit}>
      <p className="fb-warn">For your safety, please don&rsquo;t include names, phone numbers or other details that could identify you or anyone else.</p>
      <label>What is it about?
        <select name="kind" defaultValue={kind}>
          <option value="topic">Suggest a topic</option>
          <option value="error">Report an error</option>
          <option value="other">Other</option>
        </select>
      </label>
      {post && <p className="kicker" style={{ margin: 0 }}>About the post: <code>{post}</code></p>}
      <label>Message
        <textarea name="message" required minLength={3} maxLength={4000} placeholder="What should we cover, or what needs correcting (and the source, if you have one)?" />
      </label>
      <label>Email <span>Optional, only if you want a reply. It is never published.</span>
        <input type="email" name="email" autoComplete="email" maxLength={200} />
      </label>
      <div className="fb-hp" aria-hidden="true"><label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {err && <p className="fb-err" role="alert">{err}</p>}
      <div><button className="btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send'}</button></div>
    </form>
  );
}
