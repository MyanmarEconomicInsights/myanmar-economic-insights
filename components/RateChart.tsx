'use client';
import { useState } from 'react';

type Pt = { d: string; v: number };

const W = 320, H = 120, PAD = { l: 4, r: 4, t: 10, b: 18 };
const fmtDate = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Single-series line chart of the street rate with hover tooltip and a table view. */
export default function RateChart({ points, unit }: { points: Pt[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  if (points.length < 2) return null;

  const t = points.map((p) => Date.parse(p.d));
  const t0 = Math.min(...t), t1 = Math.max(...t);
  const vals = points.map((p) => p.v);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const span = hi - lo || 1;
  const x = (ms: number) => PAD.l + ((ms - t0) / (t1 - t0 || 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - (v - (lo - span * 0.15)) / (span * 1.3)) * (H - PAD.t - PAD.b);
  const xy = points.map((p, i) => [x(t[i]), y(p.v)] as const);
  const path = xy.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(1)},${b.toFixed(1)}`).join('');

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    xy.forEach(([a], i) => { if (Math.abs(a - px) < Math.abs(xy[best][0] - px)) best = i; });
    setHover(best);
  }

  const h = hover != null ? xy[hover] : null;
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Street exchange rate, ${fmtDate(points[0].d)} to ${fmtDate(points.at(-1)!.d)}`}
        onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--rule)" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {h && <line x1={h[0]} x2={h[0]} y1={PAD.t} y2={H - PAD.b} stroke="var(--ink-3)" strokeDasharray="2 3" />}
        {h && <circle cx={h[0]} cy={h[1]} r={4.5} fill="var(--accent)" stroke="var(--card)" strokeWidth={2} />}
        <text x={PAD.l} y={H - 4} fontSize="10" fill="var(--ink-3)">{fmtDate(points[0].d)}</text>
        <text x={W - PAD.r} y={H - 4} fontSize="10" fill="var(--ink-3)" textAnchor="end">{fmtDate(points.at(-1)!.d)}</text>
        <rect x={0} y={0} width={W} height={H} fill="transparent" />
      </svg>
      {h && hover != null && (
        <div className="tip" style={{ left: `${(h[0] / W) * 100}%`, top: `${(h[1] / H) * 100}%` }}>
          {fmtDate(points[hover].d)}: K{points[hover].v.toLocaleString('en-US')}
        </div>
      )}
      <details className="table-view">
        <summary>Show data table</summary>
        <table><thead><tr><th>Date</th><th>{unit}</th></tr></thead>
          <tbody>{points.map((p) => <tr key={p.d}><td>{fmtDate(p.d)}</td><td>{p.v.toLocaleString('en-US')}</td></tr>)}</tbody>
        </table>
      </details>
    </div>
  );
}
