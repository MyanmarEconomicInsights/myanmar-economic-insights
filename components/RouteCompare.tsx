import type { RouteRow } from '@/lib/compare';
import type { StatusLevel } from '@/lib/types';
import { statusText } from '@/lib/data';
import { getT, tw } from '@/lib/i18n';
import { shortDate } from './util';

const ICON: Record<StatusLevel, string> = { open: '●', restricted: '◐', serious: '▲', closed: '■' };

function Cell({ s, none, text }: { s?: RouteRow['now']; none: string; text?: string }) {
  if (!s) return <span className="pill pill-nd">{none}</span>;
  return <span className={`pill pill-${s.level}`} title={`${s.source}`}><span aria-hidden>{ICON[s.level]}</span> {text ?? s.status}</span>;
}

/** Each border or sea route: its status now and 4 weeks ago. Every cell carries an icon and a word, never colour alone. */
export default async function RouteCompare({ rows, since }: { rows: RouteRow[]; since: string }) {
  const [t, tr] = await Promise.all([getT(), statusText('trade', rows.map((r) => r.name))]);
  return (
    <div className="table-wrap">
      <table className="rcmp">
        <thead><tr><th>{t.route}</th><th>{t.now}</th><th>{shortDate(since)}</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td><b>{tw(t.lang, r.group)}</b><small>{tr.get(r.name)?.name ?? r.name}</small></td>
              <td><Cell s={r.now} none={t.no_data} text={tr.get(r.name)?.status} />{r.now && <small>{shortDate(r.now.as_of)}</small>}</td>
              <td><Cell s={r.before} none={t.no_data} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
