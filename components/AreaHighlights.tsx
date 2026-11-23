import Link from 'next/link';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories';
import type { Highlight } from '@/lib/data';
import type { CategoryKey, StatusLevel } from '@/lib/types';
import CategoryTag from './CategoryTag';
import { shortDate } from './util';

const ICON: Record<StatusLevel, string> = { open: '●', restricted: '◐', serious: '▲', closed: '■' };

/** Full detail for the hover tooltip (and screen readers), so the card itself stays one short item per line. */
const detail = (h: Highlight) => [
  `${h.label}: ${h.value}`,
  h.change ? `${h.change.pct >= 0 ? 'up' : 'down'} ${Math.abs(h.change.pct).toFixed(0)}% since ${shortDate(h.change.since)}` : h.sub,
  `Source: ${h.source}${h.date ? `, ${shortDate(h.date)}` : ''}`,
].filter(Boolean).join(' · ');

/** Key indicators: one compact card per area, 3 bullets each (Zaw chose Option A, 23 Nov): number + label, then one small grey line (change, note, or source). Hover for the full source. */
export default function AreaHighlights({ data }: { data: Record<CategoryKey, Highlight[]> }) {
  return (
    <div className="areas">
      {CATEGORY_ORDER.map((k) => (
        <section key={k} className="area" style={{ borderTopColor: `var(--cat-${k})` }}>
          <Link href={`/c/${CATEGORIES[k].slug}`} className="area-head"><CategoryTag k={k} short /></Link>
          <ul>
            {data[k].slice(0, 3).map((h) => (
              <li key={h.label} title={detail(h)} className={h.level ? 'is-status' : undefined}>
                {h.level ? (
                  <>
                    <span className={`area-ico ico-${h.level}`} aria-hidden>{ICON[h.level]}</span>
                    <b className="area-name">{h.label}</b>
                    <span className="area-sub">{h.value}</span>
                  </>
                ) : (
                  <>
                    <b className="area-val">{h.value}</b> <span className="area-lbl">{h.label}</span>
                    {h.change && Math.round(h.change.pct) !== 0 ? (
                      <span className={`area-sub ${h.change.bad ? 'bad' : 'good'}`}>
                        <span aria-hidden>{h.change.pct >= 0 ? '↑' : '↓'}</span> {Math.abs(h.change.pct).toFixed(0)}% since {shortDate(h.change.since)}
                      </span>
                    ) : (
                      <span className="area-sub">{h.sub ?? `${h.source}${h.date ? `, ${shortDate(h.date)}` : ''}`}</span>
                    )}
                  </>
                )}
              </li>
            ))}
            {!data[k].length && <li className="area-lbl">No sourced figure yet.</li>}
          </ul>
          <Link href={`/c/${CATEGORIES[k].slug}`} className="area-more">Sources and detail →</Link>
        </section>
      ))}
    </div>
  );
}
