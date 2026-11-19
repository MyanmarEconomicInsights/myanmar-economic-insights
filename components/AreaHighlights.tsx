import Link from 'next/link';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories';
import type { Highlight } from '@/lib/data';
import type { CategoryKey, StatusLevel } from '@/lib/types';
import CategoryTag from './CategoryTag';
import { shortDate } from './util';

const ICON: Record<StatusLevel, string> = { open: '●', restricted: '◐', serious: '▲', closed: '■' };

/** Key indicators: one card per area with its 1–3 highlight figures. */
export default function AreaHighlights({ data }: { data: Record<CategoryKey, Highlight[]> }) {
  return (
    <div className="areas">
      {CATEGORY_ORDER.map((k) => (
        <section key={k} className="area" style={{ borderTopColor: `var(--cat-${k})` }}>
          <Link href={`/c/${CATEGORIES[k].slug}`} className="area-head"><CategoryTag k={k} /></Link>
          <ul>
            {data[k].map((h) => (
              <li key={h.label}>
                {h.level
                  ? <span className={`pill pill-${h.level}`}><span aria-hidden>{ICON[h.level]}</span> {h.value}</span>
                  : <b className="area-val">{h.value}</b>}
                <span className="area-lbl">{h.label}</span>
                {h.change ? (
                  <span className={`area-delta ${h.change.bad ? 'bad' : 'good'}`}>
                    <span aria-hidden>{h.change.pct >= 0 ? '↑' : '↓'}</span> {Math.abs(h.change.pct).toFixed(0)}% since {shortDate(h.change.since)}
                  </span>
                ) : h.sub ? <span className="area-delta">{h.sub}</span> : null}
                <span className="area-src">{h.source}{h.date ? `, ${shortDate(h.date)}` : ''}</span>
              </li>
            ))}
            {!data[k].length && <li className="area-src">No sourced figure yet.</li>}
          </ul>
        </section>
      ))}
    </div>
  );
}
