import Link from 'next/link';
import { notFound } from 'next/navigation';
import InFocusRail from '@/components/InFocusRail';
import { periodLabel } from '@/components/PostMeta';
import { FOCUS, byDate, fmtDate, getFocusCoverage, getFocusItems } from '@/lib/focus';

export const revalidate = 300;
export const dynamicParams = false;

type Props = { params: Promise<{ topic: string }> };

export function generateStaticParams() {
  return FOCUS.map((t) => ({ topic: t.key }));
}

export async function generateMetadata({ params }: Props) {
  const { topic } = await params;
  const t = FOCUS.find((x) => x.key === topic);
  return t ? { title: `In Focus: ${t.name}`, description: t.short } : {};
}

export default async function FocusPage({ params }: Props) {
  const { topic } = await params;
  const t = FOCUS.find((x) => x.key === topic);
  if (!t) notFound();
  const [items, coverage] = await Promise.all([getFocusItems(t.key), getFocusCoverage(t)]);
  const figures = items.filter((i) => i.kind === 'figure');
  const reports = items.filter((i) => i.kind === 'report').sort(byDate);
  return (
    <div className="grid">
      <div>
        <div className="panel">
          <p className="section-title"><Link href="/focus" style={{ color: 'inherit' }}>In Focus</Link></p>
          <h1 style={{ marginTop: 0 }}>{t.name}</h1>
          <p className="dek" style={{ marginBottom: 0 }}>{t.intro}</p>
        </div>
        {figures.length > 0 && (
          <section className="panel">
            <p className="section-title">Key numbers</p>
            <div className="focus-figs">
              {figures.map((f) => (
                <div key={f.title} className="desk" style={{ borderTopColor: 'var(--cat-conflict)' }}>
                  <div className="val">{f.value}</div>
                  <p className="lbl">{f.title}</p>
                  <div className="src">{f.url ? <a href={f.url}>{f.org}</a> : f.org}{f.published_on ? `, ${fmtDate(f.published_on)}` : ''}</div>
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="panel">
          <p className="section-title">Latest reports</p>
          {reports.length ? (
            <ul className="list">
              {reports.map((r) => (
                <li key={r.title}>
                  <div className="kicker">{r.org}{r.published_on ? ` · ${fmtDate(r.published_on)}` : ''}</div>
                  {r.url ? <a href={r.url}>{r.title}</a> : <b>{r.title}</b>}
                  {r.summary && <div className="dek" style={{ margin: '4px 0 0' }}>{r.summary}</div>}
                </li>
              ))}
            </ul>
          ) : <p className="kicker">Reports coming soon.</p>}
        </section>
        <section className="panel">
          <p className="section-title">From our coverage</p>
          {coverage.length ? (
            <ul className="list">
              {coverage.map((e, i) => (
                <li key={i}>
                  <div className="kicker">{periodLabel(e.post)}</div>
                  <Link href={`/p/${e.post.slug}`}>{e.value ? `${e.value}: ` : ''}{e.label}</Link>
                </li>
              ))}
            </ul>
          ) : <p className="kicker">Nothing yet.</p>}
        </section>
      </div>
      <aside><InFocusRail /></aside>
    </div>
  );
}
