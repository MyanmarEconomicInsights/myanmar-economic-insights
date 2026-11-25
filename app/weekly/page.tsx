import Link from 'next/link';
import { periodLabel } from '@/components/PostMeta';
import InFocusRail from '@/components/InFocusRail';
import { getPosts } from '@/lib/data';
import { getT } from '@/lib/i18n';

export const revalidate = 300;
export const metadata = { title: 'Business Weekly' };

export default async function Page() {
  const [posts, t] = await Promise.all([getPosts('weekly', 200), getT()]);
  return (
    <div className="grid">
    <div className="panel">
      <h1 style={{ marginTop: 0 }}>{t.business_weekly}</h1>
      <p className="dek">{t.weekly_dek}</p>
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
    <aside><InFocusRail /></aside>
    </div>
  );
}
