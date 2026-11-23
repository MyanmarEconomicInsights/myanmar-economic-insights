import type { PriceRow, PriceSide } from '@/lib/compare';
import { shortDate } from './util';

const UNIT: Record<string, string> = { 'MMK per sack': 'a sack', 'MMK per bag': 'a bag', 'MMK per viss': 'a viss', 'MMK per litre': 'a litre' };
const k = (v: number) => 'K' + v.toLocaleString('en-US');

/** Latest price of each basket item in Yangon and one conflict-affected town. Each pair has its own scale. */
export default function PriceCompare({ rows, town }: { rows: PriceRow[]; town: string }) {
  return (
    <div className="pcmp">
      {rows.map((r) => {
        const same = r.a && r.b && r.a.unit === r.b.unit;
        const max = Math.max(r.a?.value ?? 0, r.b?.value ?? 0);
        const unit = same ? UNIT[r.a!.unit ?? ''] ?? r.a!.unit : null;
        const bar = (s: PriceSide | undefined, place: string, cls: string) => (
          <div className="pcmp-bar">
            <span className="pcmp-place">{place}</span>
            {s ? <>
              {same && <span className={`pcmp-b ${cls}`} style={{ width: `${Math.max(4, (s.value / max) * 38)}%` }} aria-hidden />}
              <span className="pcmp-v" title={`${s.source}, ${shortDate(s.date)}`}>{k(s.value)}</span>
              {!same && <span className="pcmp-u">{UNIT[s.unit ?? ''] ?? s.unit}</span>}
              <span className="pcmp-d">{shortDate(s.date)}</span>
            </> : <span className="pcmp-na">no data yet</span>}
          </div>
        );
        const ratio = same && r.a!.value ? r.b!.value / r.a!.value : null;
        return (
          <div className="pcmp-item" key={r.label}>
            <div><b>{r.label}</b> <span className="pcmp-u">{[r.note, unit && `K ${unit.replace(/^a /, 'per ')}`].filter(Boolean).join(', ')}</span></div>
            {bar(r.a, 'Yangon', 'pcmp-a')}
            {bar(r.b, town, 'pcmp-t')}
            {ratio && <div className="pcmp-r">{town} {ratio >= 1 ? `×${ratio.toFixed(1)}` : `${Math.round((1 - ratio) * 100)}% lower`}{r.a!.date !== r.b!.date ? ' · readings on different dates' : ''}</div>}
            {r.a && r.b && !same && <div className="pcmp-r">Different units, not compared</div>}
          </div>
        );
      })}
    </div>
  );
}
