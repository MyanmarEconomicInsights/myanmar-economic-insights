import { demoIndicators, demoStatus } from './demo';
import { mmtToday } from './data';
import { supabaseRead } from './supabase';
import type { Indicator, StatusItem } from './types';

/* ---------- Prices: Yangon vs a conflict-affected town ---------- */

export const COMPARE_TOWN = 'Sittwe';

/** Basket items compared on the home page. Each side names the tracked series (key + location) it reads. */
export const PRICE_COMPARE: { label: string; note?: string; a: { key: string; location: string }; b: { key: string; location: string } }[] = [
  { label: 'Rice', note: 'coarse', a: { key: 'rice_coarse', location: 'Yangon' }, b: { key: 'rice', location: COMPARE_TOWN } },
  { label: 'Onions', a: { key: 'onions', location: 'Yangon' }, b: { key: 'onions', location: COMPARE_TOWN } },
  { label: 'Fuel', note: 'Octane 92', a: { key: 'octane_92', location: 'Yangon' }, b: { key: 'octane_92', location: COMPARE_TOWN } },
  { label: 'Cooking oil', a: { key: 'palm_oil', location: 'Yangon' }, b: { key: 'cooking_oil', location: COMPARE_TOWN } },
];

export interface PriceSide { place: string; value: number; unit: string | null; date: string; source: string }
export interface PriceRow { label: string; note?: string; a?: PriceSide; b?: PriceSide }

export async function getPriceCompare(): Promise<PriceRow[]> {
  const sides = PRICE_COMPARE.flatMap((p) => [p.a, p.b]);
  const keys = [...new Set(sides.map((s) => s.key))];
  let rows: Indicator[];
  const db = supabaseRead();
  if (!db) rows = demoIndicators.filter((i) => keys.includes(i.key));
  else {
    const { data, error } = await db.from('monitor_indicators')
      .select('key,label,value,unit,location,observed_on,source').in('key', keys).order('observed_on', { ascending: false }).limit(500);
    if (error) { console.error('getPriceCompare', error.message); return []; }
    rows = ((data ?? []) as Indicator[]).map((r) => ({ ...r, value: Number(r.value) }));
  }
  const latest = (s: { key: string; location: string }): PriceSide | undefined => {
    const r = rows.filter((x) => x.key === s.key && x.location === s.location).sort((x, y) => y.observed_on.localeCompare(x.observed_on))[0];
    return r && { place: s.location, value: r.value, unit: r.unit, date: r.observed_on, source: r.source };
  };
  return PRICE_COMPARE.map((p) => ({ label: p.label, note: p.note, a: latest(p.a), b: latest(p.b) }));
}

/* ---------- Border and sea routes: now vs 4 weeks ago ---------- */

/** Which status-board rows stand for each route group. A group with no row shows "no data". */
export const ROUTES: { group: string; name: string }[] = [
  { group: 'China', name: 'Mandalay–Muse road' },
  { group: 'Thailand', name: 'Myawaddy–Mae Sot' },
  { group: 'India', name: 'Paletwa–Mizoram' },
  { group: 'India', name: 'Kyauktaw–India route' },
  { group: 'Bangladesh', name: 'Maungdaw–Teknaf' },
  { group: 'Sea', name: 'Yangon / Thilawa ports' },
];

type Snap = Pick<StatusItem, 'status' | 'level' | 'source' | 'as_of'>;
export interface RouteRow { group: string; name: string; now?: Snap; before?: Snap }

const addDays = (d: string, n: number) => {
  const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10);
};

export async function getRouteCompare(weeks = 4): Promise<{ since: string; rows: RouteRow[] }> {
  const since = addDays(mmtToday(), -7 * weeks);
  const names = ROUTES.map((r) => r.name);
  let current: StatusItem[], history: StatusItem[];
  const db = supabaseRead();
  if (!db) { current = demoStatus.filter((s) => names.includes(s.name)); history = current; }
  else {
    const cols = 'board,name,place,status,level,note,source,as_of';
    const [c, h] = await Promise.all([
      db.from('monitor_status').select(cols).eq('board', 'trade').in('name', names),
      db.from('monitor_status_history').select(cols).eq('board', 'trade').in('name', names).lte('as_of', since).order('as_of', { ascending: false }),
    ]);
    if (c.error) console.error('getRouteCompare', c.error.message);
    if (h.error) console.error('getRouteCompare history', h.error.message);
    current = (c.data ?? []) as StatusItem[];
    history = (h.data ?? []) as StatusItem[];
  }
  const rows = ROUTES.map((r) => ({
    group: r.group, name: r.name,
    now: current.find((s) => s.name === r.name),
    before: history.filter((s) => s.name === r.name && s.as_of <= since).sort((a, b) => b.as_of.localeCompare(a.as_of))[0],
  }));
  return { since, rows };
}
