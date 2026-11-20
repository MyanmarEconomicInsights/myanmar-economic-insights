import Link from 'next/link';
import { FOCUS, byDate, fmtDate, getFocusItems } from '@/lib/focus';

export default async function InFocusRail() {
  const items = await getFocusItems();
  return (
    <section className="panel focus-rail">
      <p className="section-title"><Link href="/focus" style={{ color: 'inherit', textDecoration: 'none' }}>In Focus</Link></p>
      <ul className="list">
        {FOCUS.map((t) => {
          const fig = items.find((i) => i.topic === t.key && i.kind === 'figure');
          const rep = items.filter((i) => i.topic === t.key && i.kind === 'report').sort(byDate)[0];
          return (
            <li key={t.key}>
              <Link href={`/focus/${t.key}`}>{t.name}</Link>
              {fig && <div className="focus-fig"><b>{fig.value}</b> {fig.title} <span className="src">({fig.org})</span></div>}
              <div className="kicker" style={{ marginTop: 4 }}>
                {rep ? <>Latest: {rep.org}, {fmtDate(rep.published_on)}</> : 'Reports coming soon'}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
