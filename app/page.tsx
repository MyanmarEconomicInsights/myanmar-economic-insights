import Link from 'next/link';
import CategoryCard from '@/components/CategoryCard';
import CategoryTag from '@/components/CategoryTag';
import KyatPanel from '@/components/KyatPanel';
import PostMeta, { periodLabel } from '@/components/PostMeta';
import { CATEGORY_ORDER } from '@/lib/categories';
import { getLatestByCategory, getPosts } from '@/lib/data';

export const revalidate = 300; // refresh at least every 5 minutes; new posts also refresh it instantly

export default async function Home() {
  const [latest, dailies, weeklies] = await Promise.all([getLatestByCategory(), getPosts('daily', 8), getPosts('weekly', 1)]);
  const today = dailies[0];
  const weekly = weeklies[0];

  return (
    <>
      {today && (
        <div className="today">
          <PostMeta post={today} />
          <h1><Link href={`/p/${today.slug}`}>{today.title}</Link></h1>
          {today.dek && <p className="dek">{today.dek}</p>}
        </div>
      )}

      <p className="section-title">The five areas we track</p>
      <div className="desks">
        {CATEGORY_ORDER.map((k) => <CategoryCard key={k} k={k} entry={latest[k]} />)}
      </div>

      <div className="grid" style={{ marginTop: 28 }}>
        <div>
          {weekly && (
            <article className="panel lead">
              <p className="section-title" style={{ marginBottom: 4 }}>Latest Business Weekly</p>
              <PostMeta post={weekly} />
              <h2><Link href={`/p/${weekly.slug}`}>{weekly.title}</Link></h2>
              {weekly.dek && <p className="dek">{weekly.dek}</p>}
              <ul className="five">
                {weekly.sections.map((s) => (
                  <li key={s.category}><CategoryTag k={s.category} short /><b>{s.value}</b><span>{s.label}</span></li>
                ))}
              </ul>
              <Link className="more" href={`/p/${weekly.slug}`}>Read the full issue →</Link>
            </article>
          )}
        </div>
        <aside>
          <KyatPanel />
          <section className="panel">
            <p className="section-title">Recent daily summaries</p>
            <ul className="list">
              {dailies.slice(1).map((p) => (
                <li key={p.slug}><div className="kicker">{periodLabel(p)}</div><Link href={`/p/${p.slug}`}>{p.title}</Link></li>
              ))}
              {dailies.length <= 1 && <li className="kicker">Earlier summaries will appear here.</li>}
            </ul>
            <Link className="more" href="/daily">All daily summaries →</Link>
          </section>
          <section className="panel">
            <p className="section-title">Explore the data</p>
            <p className="lbl" style={{ margin: 0 }}>Search, filter, sort and download every figure we track, updated daily.</p>
            <Link className="more" href="/data">Open the data →</Link>
          </section>
        </aside>
      </div>
    </>
  );
}
