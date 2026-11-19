import Link from 'next/link';
import CategoryCard from '@/components/CategoryCard';
import PostMeta, { periodLabel } from '@/components/PostMeta';
import StatTiles from '@/components/StatTiles';
import StatusBoard from '@/components/StatusBoard';
import WeekTable from '@/components/WeekTable';
import WeeklyChart from '@/components/WeeklyChart';
import { CATEGORY_ORDER } from '@/lib/categories';
import { getIndicatorSeries, getLatestByCategory, getPosts, getStatus, getTiles, getWeeklySeries } from '@/lib/data';

export const revalidate = 300; // refresh at least every 5 minutes; new posts also refresh it instantly

export default async function Home() {
  const [latest, dailies, weeklies, tiles, kyatWeeks, official, trade, hotspots] = await Promise.all([
    getLatestByCategory(), getPosts('daily', 8), getPosts('weekly', 8), getTiles(),
    getWeeklySeries('mmk_usd_street'), getIndicatorSeries('mmk_usd_official'), getStatus('trade'), getStatus('hotspot'),
  ]);
  const today = dailies[0];
  const weekly = weeklies[0];
  const off = official.at(-1);
  const lastK = kyatWeeks.at(-1);

  return (
    <>
      {today && (
        <div className="today">
          <PostMeta post={today} />
          <h1><Link href={`/p/${today.slug}`}>{today.title}</Link></h1>
          {today.dek && <p className="dek">{today.dek}</p>}
        </div>
      )}

      <p className="section-title">Key indicators</p>
      <StatTiles tiles={tiles} />

      <div className="grid">
        <section className="panel">
          <p className="section-title" style={{ marginBottom: 2 }}>The kyat, week by week</p>
          <div className="kicker">Street rate per US dollar, last DVB reading of each week</div>
          <WeeklyChart points={kyatWeeks} unit="MMK per USD" prefix="K" />
          {off && lastK && (
            <p className="note">Official reference rate K{off.value.toLocaleString('en-US')} ({off.source}). The street rate is {Math.round((lastK.v / off.value - 1) * 100)}% higher. Other trackers are in <Link href="/data?cat=money">the data</Link>.</p>
          )}
        </section>
        <aside>
          {weekly && (
            <section className="panel">
              <p className="section-title" style={{ marginBottom: 4 }}>Latest Business Weekly</p>
              <PostMeta post={weekly} />
              <h3 style={{ margin: '6px 0 6px', lineHeight: 1.3 }}><Link href={`/p/${weekly.slug}`}>{weekly.title}</Link></h3>
              <Link className="more" href={`/p/${weekly.slug}`}>Read the issue →</Link>
            </section>
          )}
          <section className="panel">
            <p className="section-title">Daily summaries</p>
            <ul className="list">
              {dailies.slice(1, 5).map((p) => (
                <li key={p.slug}><div className="kicker">{periodLabel(p)}</div><Link href={`/p/${p.slug}`}>{p.title}</Link></li>
              ))}
              {dailies.length <= 1 && <li className="kicker">Daily summaries start soon.</li>}
            </ul>
          </section>
        </aside>
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <p className="section-title">Week by week: the headline number in each area</p>
        <WeekTable posts={weeklies} />
        <Link className="more" href="/weekly">All issues →</Link>
      </section>

      <div className="boards">
        <StatusBoard title="Trade routes and border gates" items={trade} />
        <StatusBoard title="Economic pressure points" items={hotspots} />
      </div>

      <p className="section-title">The five areas we track</p>
      <div className="desks">
        {CATEGORY_ORDER.map((k) => <CategoryCard key={k} k={k} entry={latest[k]} />)}
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <p className="section-title">Explore the data</p>
        <p className="lbl" style={{ margin: 0 }}>Search, filter, sort and download every figure we track, updated daily.</p>
        <Link className="more" href="/data">Open the data →</Link>
      </section>
    </>
  );
}
