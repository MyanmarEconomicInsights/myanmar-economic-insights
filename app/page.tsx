import Link from 'next/link';
import AreaHighlights from '@/components/AreaHighlights';
import DayPicker from '@/components/DayPicker';
import PriceCompare from '@/components/PriceCompare';
import RouteCompare from '@/components/RouteCompare';
import InFocusRail from '@/components/InFocusRail';
import InformalPanel from '@/components/InformalPanel';
import PostMeta, { periodLabel } from '@/components/PostMeta';
import StatusBoard from '@/components/StatusBoard';
import WeekTable from '@/components/WeekTable';
import WeeklyChart from '@/components/WeeklyChart';
import { getPriceCompare, getRouteCompare } from '@/lib/compare';
import { getT } from '@/lib/i18n';
import { getContentDays, getHighlights, getIndicatorSeries, getPosts, getStatus, getWeeklySeries } from '@/lib/data';

export const revalidate = 300; // refresh at least every 5 minutes; new posts also refresh it instantly

export default async function Home() {
  const [highlights, dailies, weeklies, kyatWeeks, official, trade, hotspots, prices, routes, days] = await Promise.all([
    getHighlights(), getPosts('daily', 8), getPosts('weekly', 8),
    getWeeklySeries('mmk_usd_street'), getIndicatorSeries('mmk_usd_official'), getStatus('trade'), getStatus('hotspot'),
    getPriceCompare(), getRouteCompare(), getContentDays(),
  ]);
  const t = await getT();
  const my = t.lang === 'my';
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

      <p className="section-title">{t.key_indicators}</p>
      <AreaHighlights data={highlights} />

      <div className="trio">
        <section className="panel" style={{ borderTop: '4px solid var(--cat-money)' }}>
          <p className="section-title" style={{ marginBottom: 2 }}>{t.kyat_week}</p>
          <div className="kicker">{t.kyat_week_kicker}</div>
          <WeeklyChart points={kyatWeeks} unit="MMK per USD" prefix="K" width={380} />
          {off && lastK && (
            <p className="note">{t.official_note(off.value.toLocaleString('en-US'), off.source, Math.round((lastK.v / off.value - 1) * 100))} <Link href="/data?cat=money">{t.the_data}</Link>.</p>
          )}
        </section>
        <section className="panel" style={{ borderTop: '4px solid var(--cat-prices)' }}>
          <p className="section-title" style={{ marginBottom: 2 }}>{t.prices_vs} {my ? ({ Sittwe: 'စစ်တွေ', Myitkyina: 'မြစ်ကြီးနား', Lashio: 'လားရှိုး', 'Hpa-An': 'ဘားအံ', Monywa: 'မုံရွာ', Kalay: 'ကလေး' } as Record<string, string>)[prices.town] ?? prices.town : prices.town}</p>
          <div className="kicker">{t.prices_kicker}</div>
          <PriceCompare rows={prices.rows.slice(0, 3)} town={prices.town} />
          <Link className="more" href="/c/prices">{t.all_prices}</Link>
        </section>
        <section className="panel" style={{ borderTop: '4px solid var(--cat-trade)' }}>
          <p className="section-title" style={{ marginBottom: 2 }}>{t.routes_title}</p>
          <div className="kicker">{t.routes_kicker}</div>
          <RouteCompare rows={routes.rows.filter((r) => r.now).slice(0, 3)} since={routes.since} />
          <Link className="more" href="/c/trade#board">{t.all_routes}</Link>
        </section>
      </div>

      <div className="grid" style={{ alignItems: 'start', marginTop: 24 }}>
        <div>
            <section className="panel">
              <p className="section-title">{t.todays_daily}</p>
              <ul className="list">
                {dailies.slice(0, 1).map((p) => (
                  <li key={p.slug}><div className="kicker">{periodLabel(p)}</div><Link href={`/p/${p.slug}`}>{p.title}</Link>
                    {p.sections.length > 0 && (
                      <ul className="mini">{p.sections.map((s, i) => <li key={i}>{s.value && <b>{s.value}</b>} {s.label}</li>)}</ul>
                    )}
                  </li>
                ))}
                {!dailies.length && <li className="kicker">{t.daily_soon}</li>}
              </ul>
              <Link className="more" href="/daily">{t.prev_daily}</Link>
            </section>
          {weekly && (
            <section className="panel">
              <p className="section-title" style={{ marginBottom: 4 }}>{t.latest_weekly}</p>
              <PostMeta post={weekly} />
              <h3 style={{ margin: '6px 0 6px', lineHeight: 1.3 }}><Link href={`/p/${weekly.slug}`}>{weekly.title}</Link></h3>
              <Link className="more" href={`/p/${weekly.slug}`}>{t.read_issue}</Link>
            </section>
          )}
          <InformalPanel />
        </div>
        <aside>
          <InFocusRail />
          <section className="panel">
            <p className="section-title">{t.pick_day}</p>
            <DayPicker daily={days.daily} other={days.other} />
            <p className="note">{t.pick_day_note} <Link href="/daily">{t.all_daily}</Link></p>
          </section>
        </aside>
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <p className="section-title">{t.week_by_week}</p>
        <WeekTable posts={weeklies.slice(0, 3)} />
        <Link className="more" href="/weekly">{t.all_issues}</Link>
      </section>

      <div className="boards" id="routes">
        <StatusBoard title={t.board_trade} items={trade} limit={4} moreHref="/c/trade#board" moreLabel={t.all_routes_gates} />
        <StatusBoard title={t.board_hotspot} items={hotspots} limit={4} moreHref="/c/conflict#board" moreLabel={t.all_points} />
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <p className="section-title">{t.explore}</p>
        <p className="lbl" style={{ margin: 0 }}>{t.explore_lbl}</p>
        <Link className="more" href="/data">{t.open_data}</Link>
      </section>
    </>
  );
}
