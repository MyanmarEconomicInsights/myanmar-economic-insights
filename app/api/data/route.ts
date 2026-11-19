import { NextResponse } from 'next/server';
import { isCategory } from '@/lib/categories';
import { getAllIndicators } from '@/lib/data';

export const revalidate = 300;

const CSV_COLS = ['observed_on', 'category', 'label', 'location', 'value', 'unit', 'source', 'source_url', 'note', 'key'] as const;
const esc = (v: unknown) => {
  const s = v == null ? '' : String(v);
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s; // stop spreadsheet formula injection
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/**
 * Public, read-only access to every tracked figure.
 * GET /api/data?format=csv|json&category=prices&key=lpg&location=Yangon&from=2026-10-01&to=2026-11-30
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/;
  let rows = await getAllIndicators();
  const cat = q.get('category'), key = q.get('key'), loc = q.get('location'), from = q.get('from'), to = q.get('to');
  if (cat && isCategory(cat)) rows = rows.filter((r) => r.category === cat);
  if (key) rows = rows.filter((r) => r.key === key);
  if (loc != null) rows = rows.filter((r) => (r.location || 'National').toLowerCase() === loc.toLowerCase());
  if (from && date.test(from)) rows = rows.filter((r) => r.observed_on >= from);
  if (to && date.test(to)) rows = rows.filter((r) => r.observed_on <= to);

  if (q.get('format') === 'json') {
    return NextResponse.json({ count: rows.length, data: rows }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }
  const csv = [CSV_COLS.join(','), ...rows.map((r) => CSV_COLS.map((c) => esc((r as any)[c])).join(','))].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="myanmar-economy-data-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Access-Control-Allow-Origin': '*',
    },
  });
}
