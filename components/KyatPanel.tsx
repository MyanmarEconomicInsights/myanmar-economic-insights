import { getIndicatorSeries } from '@/lib/data';
import RateChart from './RateChart';
import { shortDate } from './util';

export default async function KyatPanel() {
  const [street, official] = await Promise.all([getIndicatorSeries('mmk_usd_street'), getIndicatorSeries('mmk_usd_official')]);
  const last = street.at(-1), first = street[0], off = official.at(-1);
  if (!last) return null;
  return (
    <section className="panel">
      <p className="section-title">Kyat, street rate</p>
      <div className="stat">
        <span className="big">K{last.value.toLocaleString('en-US')}</span>
        {first && first !== last && (
          <span className="delta">
            {last.value >= first.value ? '▲' : '▼'} {Math.abs(((last.value - first.value) / first.value) * 100).toFixed(1)}% since {shortDate(first.observed_on)}
          </span>
        )}
      </div>
      <div className="kicker">per US dollar · {last.source}, {shortDate(last.observed_on)}</div>
      <RateChart points={street.map((s) => ({ d: s.observed_on, v: s.value }))} unit="MMK per USD" />
      {off && (
        <p className="note">Official reference rate: K{off.value.toLocaleString('en-US')} ({off.source}). The street rate is {Math.round((last.value / off.value - 1) * 100)}% higher.</p>
      )}
    </section>
  );
}
