import Link from 'next/link';
import { FOCUS, byDate, fmtDate, getFocusItems } from '@/lib/focus';
import { FOCUS_MY, getT } from '@/lib/i18n';

export default async function InFocusRail() {
  const [items, t] = await Promise.all([getFocusItems(), getT()]);
  return (
    <section className="panel focus-rail">
      <p className="section-title"><Link href="/focus" style={{ color: 'inherit', textDecoration: 'none' }}>{t.in_focus}</Link></p>
      <ul className="list">
        {FOCUS.map((f) => {
          const fig = items.find((i) => i.topic === f.key && i.kind === 'figure');
          const rep = items.filter((i) => i.topic === f.key && i.kind === 'report').sort(byDate)[0];
          return (
            <li key={f.key}>
              <Link href={`/focus/${f.key}`}>{t.lang === 'my' ? FOCUS_MY[f.key] : f.name}</Link>
              {fig && <div className="focus-fig"><b>{fig.value}</b> {fig.title} <span className="src">({fig.org})</span></div>}
              <div className="kicker" style={{ marginTop: 4 }}>
                {rep ? <>{t.latest_rep}: {rep.org}, {fmtDate(rep.published_on)}</> : t.reports_soon}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
