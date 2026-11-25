import type { Indicator } from '@/lib/types';
import { getT } from '@/lib/i18n';
import { shortDate } from './util';

export default async function IndicatorTable({ rows }: { rows: Indicator[] }) {
  const t = await getT();
  if (!rows.length) return <p className="kicker">{t.no_tracked}</p>;
  return (
    <div className="table-wrap">
      <table className="ind">
        <thead><tr><th>{t.item}</th><th>{t.where}</th><th className="num">{t.latest}</th><th>{t.unit}</th><th>{t.date}</th><th>{t.source}</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key + r.location}>
              <td>{r.label}</td>
              <td>{r.location || t.national}</td>
              <td className="num">{r.value.toLocaleString('en-US')}</td>
              <td>{r.unit}</td>
              <td>{shortDate(r.observed_on)}</td>
              <td>{r.source_url ? <a href={r.source_url} target="_blank" rel="noopener noreferrer">{r.source}</a> : r.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
