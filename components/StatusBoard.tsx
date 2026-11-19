import type { StatusItem, StatusLevel } from '@/lib/types';
import { shortDate } from './util';

const ICON: Record<StatusLevel, string> = { open: '●', restricted: '◐', serious: '▲', closed: '■' };

/** A list of places with a coloured status pill. The pill always carries text + an icon, never colour alone. */
export default function StatusBoard({ title, items }: { title: string; items: StatusItem[] }) {
  if (!items.length) return null;
  const latest = items.map((i) => i.as_of).sort().at(-1)!;
  return (
    <section className="board">
      <p className="section-title">{title} <span className="board-asof">· updated {shortDate(latest)}</span></p>
      <ul className="board-list">
        {items.map((i) => (
          <li key={i.name}>
            <div className="board-main">
              <b>{i.name}</b>
              <span className="board-place">{i.place}</span>
              {i.note && <span className="board-note">{i.note}</span>}
            </div>
            <div className="board-side">
              <span className={`pill pill-${i.level}`}><span aria-hidden>{ICON[i.level]}</span> {i.status}</span>
              <span className="board-src">{i.source}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
