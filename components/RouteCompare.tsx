import type { RouteRow } from '@/lib/compare';
import type { StatusLevel } from '@/lib/types';
import { shortDate } from './util';

const ICON: Record<StatusLevel, string> = { open: '●', restricted: '◐', serious: '▲', closed: '■' };

function Cell({ s }: { s?: RouteRow['now'] }) {
  if (!s) return <span className="pill pill-nd">— no data</span>;
  return <span className={`pill pill-${s.level}`} title={`${s.source}`}><span aria-hidden>{ICON[s.level]}</span> {s.status}</span>;
}

/** Each border or sea route: its status now and 4 weeks ago. Every cell carries an icon and a word, never colour alone. */
export default function RouteCompare({ rows, since }: { rows: RouteRow[]; since: string }) {
  return (
    <div className="table-wrap">
      <table className="rcmp">
        <thead><tr><th>Route</th><th>Now</th><th>{shortDate(since)}</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td><b>{r.group}</b><small>{r.name}</small></td>
              <td><Cell s={r.now} />{r.now && <small>{shortDate(r.now.as_of)}</small>}</td>
              <td><Cell s={r.before} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
