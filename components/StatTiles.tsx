import type { Tile } from '@/lib/data';
import { shortDate } from './util';

/** Row of compact stat tiles: label · value · change (or a short note) · source and date. */
export default function StatTiles({ tiles }: { tiles: Tile[] }) {
  if (!tiles.length) return null;
  return (
    <div className="tiles">
      {tiles.map((t) => (
        <div className="tile" key={t.label}>
          <div className="tile-lbl">{t.label}</div>
          <div className="tile-val">{t.value}</div>
          {t.change ? (
            <div className={`tile-delta ${t.change.bad ? 'bad' : 'good'}`}>
              <span aria-hidden>{t.change.pct >= 0 ? '↑' : '↓'}</span> {Math.abs(t.change.pct).toFixed(1)}% since {shortDate(t.change.since)}
            </div>
          ) : t.sub ? <div className="tile-delta">{t.sub}</div> : null}
          <div className="tile-src">{t.source}, {shortDate(t.date)}</div>
        </div>
      ))}
    </div>
  );
}
