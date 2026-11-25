import Link from 'next/link';
import DayPicker from '@/components/DayPicker';
import { periodLabel } from '@/components/PostMeta';
import { getContentDays, getPosts } from '@/lib/data';
import { getT } from '@/lib/i18n';

export const revalidate = 300;
export const metadata = { title: 'Daily summaries' };

export default async function Page() {
  const [posts, days, t] = await Promise.all([getPosts('daily', 200), getContentDays(), getT()]);
  return (
    <div className="grid" style={{ alignItems: 'start' }}>
      <div className="panel">
        <h1 style={{ marginTop: 0 }}>{t.daily_h1}</h1>
        <p className="dek">{t.daily_dek}</p>
        <ul className="list">
          {posts.map((p) => (
            <li key={p.slug}>
              <div className="kicker">{periodLabel(p)}</div>
              <Link href={`/p/${p.slug}`}>{p.title}</Link>
              {p.dek && <div className="dek" style={{ margin: '4px 0 0' }}>{p.dek}</div>}
            </li>
          ))}
          {!posts.length && <li>{t.nothing_yet}</li>}
        </ul>
      </div>
      <aside className="panel" style={{ marginTop: 0 }}>
        <p className="section-title">{t.pick_day}</p>
        <DayPicker daily={days.daily} other={days.other} />
        <p className="note">{t.daily_pick_note}</p>
      </aside>
    </div>
  );
}
