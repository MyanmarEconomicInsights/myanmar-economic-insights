'use client';
import { useState } from 'react';

type Pt = { week: string; d: string; v: number };

const W_FULL = 640, H = 220, PAD = { l: 52, r: 16, t: 16, b: 40 };
const fmtDate = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Week-by-week line (one point per week) with a value axis, hover tooltip and a table view. */
export default function WeeklyChart({ points, unit, prefix = '', width = W_FULL }: { points: Pt[]; unit: string; prefix?: string; width?: number }) {
  const W = width; // a narrower viewBox keeps the labels readable in a small panel
  const [hover, setHover] = useState<number | null>(null);
  if (points.length < 2) return null;

  const vals = points.map((p) => p.v);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const step = niceStep((hi - lo) / 3 || hi * 0.05);
  const y0 = Math.floor(lo / step) * step - step, y1 = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = y0; v <= y1 + 1e-9; v += step) ticks.push(v);
  const ts = points.map((p) => Date.parse(p.d)), t0 = ts[0], t1 = ts[ts.length - 1];
  // x follows the calendar, so a week with no reading leaves a visible gap rather than being squeezed out
  const x = (i: number) => PAD.l + 18 + ((ts[i] - t0) / (t1 - t0 || 1)) * (W - PAD.l - PAD.r - 36);
  const y = (v: number) => PAD.t + (1 - (v - y0) / (y1 - y0)) * (H - PAD.t - PAD.b);
  const xy = points.map((p, i) => [x(i), y(p.v)] as const);
  const path = xy.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(1)},${b.toFixed(1)}`).join('');
  const fmt = (v: number) => prefix + v.toLocaleString('en-US');

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    xy.forEach(([a], i) => { if (Math.abs(a - px) < Math.abs(xy[best][0] - px)) best = i; });
    setHover(best);
  }
  // Week labels: always show the last one, then walk back and skip any that would overlap the label to their right.
  const showLabel = points.map(() => false);
  for (let i = points.length - 1, right = Infinity; i >= 0; i--) {
    if (right - xy[i][0] >= 44) { showLabel[i] = true; right = xy[i][0]; }
  }
  const h = hover != null ? xy[hover] : null;
  const last = points.length - 1;

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`${unit}, week by week, ${points[0].week} to ${points[last].week}: ${fmt(points[0].v)} to ${fmt(points[last].v)}`}
        onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke={v === y0 ? 'var(--axis)' : 'var(--grid)'} />
            <text x={PAD.l - 8} y={y(v) + 4} fontSize="11" fill="var(--ink-3)" textAnchor="end">{fmt(v)}</text>
          </g>
        ))}
        {points.map((p, i) => showLabel[i] && (
          <g key={p.week}>
            <text x={x(i)} y={H - PAD.b + 16} fontSize="11" fill="var(--ink-2)" textAnchor="middle">{p.week}</text>
            <text x={x(i)} y={H - PAD.b + 30} fontSize="10" fill="var(--ink-3)" textAnchor="middle">{fmtDate(p.d)}</text>
          </g>
        ))}
        {h && <line x1={h[0]} x2={h[0]} y1={PAD.t} y2={H - PAD.b} stroke="var(--ink-3)" strokeDasharray="2 3" />}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {xy.map(([a, b], i) => (
          <circle key={i} cx={a} cy={b} r={hover === i ? 6 : 4.5} fill="var(--accent)" stroke="var(--card)" strokeWidth={2} />
        ))}
        <text x={xy[last][0]} y={xy[last][1] - 12} fontSize="12" fontWeight="600" fill="var(--ink)" textAnchor="end">{fmt(points[last].v)}</text>
        <rect x={0} y={0} width={W} height={H} fill="transparent" />
      </svg>
      {h && hover != null && (
        <div className="tip" style={{ left: `${(h[0] / W) * 100}%`, top: `${(h[1] / H) * 100}%` }}>
          {points[hover].week} · {fmtDate(points[hover].d)}: {fmt(points[hover].v)}
        </div>
      )}
      <details className="table-view">
        <summary>Show data table</summary>
        <table><thead><tr><th>Week</th><th>Date</th><th>{unit}</th></tr></thead>
          <tbody>{points.map((p) => <tr key={p.week}><td>{p.week}</td><td>{fmtDate(p.d)}</td><td>{p.v.toLocaleString('en-US')}</td></tr>)}</tbody>
        </table>
      </details>
    </div>
  );
}

function niceStep(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}
