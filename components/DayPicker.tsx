'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const MMT_MS = 6.5 * 3600_000;
const mmtNow = () => new Date(Date.now() + MMT_MS); // read with getUTC* = Myanmar wall-clock time
const ymd = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Small calendar in Myanmar time. Days with a daily summary are solid links; days with other items are lighter links. */
export default function DayPicker({ daily, other, selected }: { daily: string[]; other: string[]; selected?: string }) {
  const dailySet = useMemo(() => new Set(daily), [daily]);
  const otherSet = useMemo(() => new Set(other), [other]);
  const start = selected ?? daily.at(-1) ?? mmtNow().toISOString().slice(0, 10);
  const [ym, setYm] = useState({ y: +start.slice(0, 4), m: +start.slice(5, 7) - 1 });
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(mmtNow()); const t = setInterval(() => setNow(mmtNow()), 30_000); return () => clearInterval(t); }, []);
  const today = now ? now.toISOString().slice(0, 10) : '';

  const first = new Date(Date.UTC(ym.y, ym.m, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Monday-first
  const nDays = new Date(Date.UTC(ym.y, ym.m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: nDays }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const shift = (n: number) => setYm(({ y, m }) => { const d = new Date(Date.UTC(y, m + n, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; });
  const clock = now?.toLocaleString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

  return (
    <div className="daypick">
      <div className="daypick-clock" aria-live="off">
        <span className="kicker">Myanmar time (UTC+6:30)</span>
        <b>{clock ?? ' '}</b>
      </div>
      <div className="daypick-head">
        <button type="button" onClick={() => shift(-1)} aria-label="Previous month">‹</button>
        <span>{MONTHS[ym.m]} {ym.y}</span>
        <button type="button" onClick={() => shift(1)} aria-label="Next month">›</button>
      </div>
      <table className="daypick-grid">
        <thead><tr>{['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => <th key={d} scope="col">{d}</th>)}</tr></thead>
        <tbody>
          {Array.from({ length: cells.length / 7 }, (_, r) => (
            <tr key={r}>
              {cells.slice(r * 7, r * 7 + 7).map((d, i) => {
                if (!d) return <td key={i} />;
                const iso = ymd(ym.y, ym.m, d);
                const cls = [dailySet.has(iso) ? 'has-daily' : otherSet.has(iso) ? 'has-other' : 'empty',
                  iso === selected ? 'sel' : '', iso === today ? 'today' : ''].join(' ');
                const label = dailySet.has(iso) ? 'daily summary' : otherSet.has(iso) ? 'weekly or figures' : 'nothing published';
                return (
                  <td key={i}>
                    {dailySet.has(iso) || otherSet.has(iso)
                      ? <Link href={`/day/${iso}`} className={cls} aria-label={`${MONTHS[ym.m]} ${d}: ${label}`}>{d}</Link>
                      : <span className={cls} aria-label={`${MONTHS[ym.m]} ${d}: ${label}`}>{d}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="daypick-key">
        <span><i className="k-daily" /> Daily summary</span>
        <span><i className="k-other" /> Weekly or figures</span>
        <span><i className="k-today" /> Today</span>
      </div>
    </div>
  );
}
