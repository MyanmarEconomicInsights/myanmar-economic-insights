import type { Indicator } from '@/lib/types';
import { shortDate } from './util';

export default function IndicatorTable({ rows }: { rows: Indicator[] }) {
  if (!rows.length) return <p className="kicker">No tracked figures yet.</p>;
  return (
    <div className="table-wrap">
      <table className="ind">
        <thead><tr><th>Item</th><th>Where</th><th className="num">Latest</th><th>Unit</th><th>Date</th><th>Source</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key + r.location}>
              <td>{r.label}</td>
              <td>{r.location || 'National'}</td>
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
