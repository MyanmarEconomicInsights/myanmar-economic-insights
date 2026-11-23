import Link from 'next/link';
import { notFound } from 'next/navigation';
import DayPicker from '@/components/DayPicker';
import IndicatorTable from '@/components/IndicatorTable';
import { periodLabel } from '@/components/PostMeta';
import SectionBlock from '@/components/SectionBlock';
import { getContentDays, getDay } from '@/lib/data';

export const revalidate = 300;

const ICON: Record<string, string> = { open: '●', restricted: '◐', serious: '▲', closed: '■' };

type Props = { params: Promise<{ date: string }> };

const valid = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d + 'T00:00:00Z'));
const human = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const short = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const step = (d: string, n: number) => { const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };

export async function generateMetadata({ params }: Props) {
  const { date } = await params;
  return valid(date) ? { title: human(date), description: `Myanmar economic news for ${human(date)} (Myanmar time).` } : {};
}

export default async function DayPage({ params }: Props) {
  const { date } = await params;
  if (!valid(date)) notFound();
  const [{ posts, indicators, status }, days] = await Promise.all([getDay(date), getContentDays()]);
  const daily = posts.find((p) => p.kind === 'daily');
  const weeklies = posts.filter((p) => p.kind === 'weekly');
  const nothing = !posts.length && !indicators.length && !status.length;

  return (
    <div className="grid" style={{ alignItems: 'start' }}>
      <div className="panel">
        <div className="kicker">
          <Link href={`/day/${step(date, -1)}`}>← {short(step(date, -1))}</Link>{' · '}Myanmar time{' · '}
          <Link href={`/day/${step(date, 1)}`}>{short(step(date, 1))} →</Link>
        </div>
        <h1 style={{ margin: '6px 0 4px' }}>{human(date)}</h1>
        {nothing && <p className="dek">Nothing was published for this day. Pick a highlighted day on the calendar.</p>}

        {daily && (
          <>
            <p className="section-title" style={{ marginTop: 18 }}>Daily summary</p>
            <h2 style={{ margin: '0 0 4px', fontSize: 20 }}><Link href={`/p/${daily.slug}`}>{daily.title}</Link></h2>
            {daily.dek && <p className="dek">{daily.dek}</p>}
            {daily.sections.map((s) => <SectionBlock key={s.category} s={s} />)}
          </>
        )}

        {weeklies.length > 0 && (
          <>
            <p className="section-title" style={{ marginTop: 22 }}>Business Weekly covering this day</p>
            <ul className="list">
              {weeklies.map((p) => (
                <li key={p.slug}>
                  <div className="kicker">{periodLabel(p)}</div>
                  <Link href={`/p/${p.slug}`}>{p.title}</Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {indicators.length > 0 && (
          <>
            <p className="section-title" style={{ marginTop: 22 }}>Figures recorded for this day</p>
            <IndicatorTable rows={indicators} />
          </>
        )}

        {status.length > 0 && (
          <>
            <p className="section-title" style={{ marginTop: 22 }}>Status updates</p>
            <ul className="list">
              {status.map((s) => (
                <li key={s.board + s.name}>
                  <b>{s.name}</b> <span className={`pill pill-${s.level}`}><span aria-hidden>{ICON[s.level]}</span> {s.status}</span>
                  {s.note && <div className="board-note">{s.note}</div>}
                  <div className="src">Source: {s.source}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <aside className="panel" style={{ marginTop: 0 }}>
        <p className="section-title">Pick a day</p>
        <DayPicker daily={days.daily} other={days.other} selected={date} />
      </aside>
    </div>
  );
}
