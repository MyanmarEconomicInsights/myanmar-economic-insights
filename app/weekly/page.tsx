import Link from 'next/link';
import { periodLabel } from '@/components/PostMeta';
import InFocusRail from '@/components/InFocusRail';
import { getPosts } from '@/lib/data';

export const revalidate = 300;
export const metadata = { title: 'Business Weekly' };

export default async function Page() {
  const posts = await getPosts('weekly', 200);
  return (
    <div className="grid">
    <div className="panel">
      <h1 style={{ marginTop: 0 }}>Business Weekly</h1>
      <p className="dek">The weekly issue: one headline number for each of the five categories.</p>
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
    <aside><InFocusRail /></aside>
    </div>
  );
}
