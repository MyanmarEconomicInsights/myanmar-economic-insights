import Link from 'next/link';
import DayPicker from '@/components/DayPicker';
import { periodLabel } from '@/components/PostMeta';
import { getContentDays, getPosts } from '@/lib/data';

export const revalidate = 300;
export const metadata = { title: 'Daily summaries' };

export default async function Page() {
  const [posts, days] = await Promise.all([getPosts('daily', 200), getContentDays()]);
  return (
    <div className="grid" style={{ alignItems: 'start' }}>
      <div className="panel">
        <h1 style={{ marginTop: 0 }}>Daily summaries</h1>
        <p className="dek">A short read on each day's Myanmar economic news. Dates are Myanmar time.</p>
        <ul className="list">
          {posts.map((p) => (
            <li key={p.slug}>
              <div className="kicker">{periodLabel(p)}</div>
              <Link href={`/p/${p.slug}`}>{p.title}</Link>
              {p.dek && <div className="dek" style={{ margin: '4px 0 0' }}>{p.dek}</div>}
            </li>
          ))}
          {!posts.length && <li>Nothing published yet.</li>}
        </ul>
      </div>
      <aside className="panel" style={{ marginTop: 0 }}>
        <p className="section-title">Pick a day</p>
        <DayPicker daily={days.daily} other={days.other} />
        <p className="note">Pick a day to see its daily summary, the weekly issue that covers it and any figures recorded that day.</p>
      </aside>
    </div>
  );
}
