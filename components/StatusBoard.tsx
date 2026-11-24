import Link from 'next/link';
import type { StatusItem, StatusLevel } from '@/lib/types';
import SourceLink from './SourceLink';
import { shortDate } from './util';

const ICON: Record<StatusLevel, string> = { open: '●', restricted: '◐', serious: '▲', closed: '■' };

/** A list of places with a coloured status pill. The pill always carries text + an icon, never colour alone. */
export default function StatusBoard({ title, items, limit, moreHref, moreLabel, id }: {
  title: string; items: StatusItem[]; limit?: number; moreHref?: string; moreLabel?: string; id?: string;
}) {
  if (!items.length) return null;
  const latest = items.map((i) => i.as_of).sort().at(-1)!;
  return (
    <section className="board" id={id}>
      <p className="section-title">{title} <span className="board-asof">· updated {shortDate(latest)}</span></p>
      <ul className="board-list">
        {items.slice(0, limit ?? items.length).map((i) => (
          <li key={i.name}>
            <div className="board-main">
              <b>{i.name}</b>
              <span className="board-place">{i.place}</span>
              {i.note && <span className="board-note">{i.note}</span>}
            </div>
            <div className="board-side">
              <span className={`pill pill-${i.level}`}><span aria-hidden>{ICON[i.level]}</span> {i.status}</span>
              <span className="board-src"><SourceLink name={i.source} url={i.source_url} /></span>
            </div>
          </li>
        ))}
      </ul>
      {moreHref && limit != null && items.length > limit && (
        <Link className="more" href={moreHref}>{moreLabel ?? 'See all'} ({items.length}) →</Link>
      )}
    </section>
  );
}
