import type { PriceRow, PriceSide } from '@/lib/compare';
import { getT, tw } from '@/lib/i18n';
import { shortDate } from './util';

const UNIT: Record<string, string> = { 'MMK per sack': 'a sack', 'MMK per bag': 'a bag', 'MMK per viss': 'a viss', 'MMK per litre': 'a litre' };
const k = (v: number) => 'K' + v.toLocaleString('en-US');

/** Latest price of each basket item in Yangon and one conflict-affected town. Each pair has its own scale. */
export default async function PriceCompare({ rows, town: townEn }: { rows: PriceRow[]; town: string }) {
  const t = await getT();
  const town = tw(t.lang, townEn);
  const U = (u: string | null | undefined) => tw(t.lang, UNIT[u ?? ''] ?? u ?? '');
  return (
    <div className="pcmp">
      {rows.map((r) => {
        const same = r.a && r.b && r.a.unit === r.b.unit;
        const max = Math.max(r.a?.value ?? 0, r.b?.value ?? 0);
        const unit = same ? UNIT[r.a!.unit ?? ''] ?? r.a!.unit : null;
        const unitTxt = unit ? (t.lang === 'my' ? `K ${tw(t.lang, unit)}` : `K ${unit.replace(/^a /, 'per ')}`) : null;
        const bar = (s: PriceSide | undefined, place: string, cls: string) => (
          <div className="pcmp-bar">
            <span className="pcmp-place">{place}</span>
            {s ? <>
              {same && <span className={`pcmp-b ${cls}`} style={{ width: `${Math.max(4, (s.value / max) * 38)}%` }} aria-hidden />}
              <span className="pcmp-v" title={`${s.source}, ${shortDate(s.date)}`}>{k(s.value)}</span>
              {!same && <span className="pcmp-u">{U(s.unit)}</span>}
              <span className="pcmp-d">{shortDate(s.date)}</span>
            </> : <span className="pcmp-na">{t.no_data_yet}</span>}
          </div>
        );
        const ratio = same && r.a!.value ? r.b!.value / r.a!.value : null;
        return (
          <div className="pcmp-item" key={r.label}>
            <div><b>{tw(t.lang, r.label)}</b> <span className="pcmp-u">{[r.note && tw(t.lang, r.note), unitTxt].filter(Boolean).join(', ')}</span></div>
            {bar(r.a, tw(t.lang, 'Yangon'), 'pcmp-a')}
            {bar(r.b, town, 'pcmp-t')}
            {ratio && <div className="pcmp-r">{town} {ratio >= 1 ? `×${ratio.toFixed(1)}` : `${Math.round((1 - ratio) * 100)}% ${t.lower}`}{r.a!.date !== r.b!.date ? t.diff_dates : ''}</div>}
            {r.a && r.b && !same && <div className="pcmp-r">{t.diff_units}</div>}
          </div>
        );
      })}
    </div>
  );
}
