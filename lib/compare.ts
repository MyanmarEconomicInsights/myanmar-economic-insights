import { demoIndicators, demoStatus } from './demo';
import { mmtToday } from './data';
import { supabaseRead } from './supabase';
import type { Indicator, StatusItem } from './types';

/* ---------- Prices: Yangon vs a conflict-affected town ---------- */

/** Conflict-affected towns compared with Yangon (Zaw, 24 Nov: this pool for 2026–27; can change). */
export const COMPARE_TOWNS = ['Sittwe', 'Myitkyina', 'Lashio', 'Hpa-An', 'Monywa', 'Kalay'];

/** The town changes twice a week, on Monday and Thursday (Myanmar time), in the order above, starting Mon 23 Nov 2026. */
export function rotationIndex(today: string): number {
  const days = Math.floor((Date.parse(today + 'T00:00:00Z') - Date.parse('2026-11-23T00:00:00Z')) / 86400000);
  const slots = Math.floor(days / 7) * 2 + (((days % 7) + 7) % 7 >= 3 ? 1 : 0);
  return ((slots % COMPARE_TOWNS.length) + COMPARE_TOWNS.length) % COMPARE_TOWNS.length;
}

/** Basket items compared on the home page: Yangon series key, and the key used for each conflict town. */
export const PRICE_COMPARE: { label: string; note?: string; a: { key: string; location: string }; townKey: string }[] = [
  { label: 'Rice', note: 'coarse', a: { key: 'rice_coarse', location: 'Yangon' }, townKey: 'rice' },
  { label: 'Onions', a: { key: 'onions', location: 'Yangon' }, townKey: 'onions' },
  { label: 'Fuel', note: 'Octane 92', a: { key: 'octane_92', location: 'Yangon' }, townKey: 'octane_92' },
  { label: 'Cooking oil', a: { key: 'palm_oil', location: 'Yangon' }, townKey: 'cooking_oil' },
];

export interface PriceSide { place: string; value: number; unit: string | null; date: string; source: string }
export interface PriceRow { label: string; note?: string; a?: PriceSide; b?: PriceSide }

/** Yangon vs this slot's town. If that town has fewer than 2 of the first 3 items priced, the next town in the pool is used. */
export async function getPriceCompare(): Promise<{ town: string; rows: PriceRow[] }> {
  const keys = [...new Set(PRICE_COMPARE.flatMap((p) => [p.a.key, p.townKey]))];
  let rows: Indicator[];
  const db = supabaseRead();
  if (!db) rows = demoIndicators.filter((i) => keys.includes(i.key));
  else {
    const { data, error } = await db.from('monitor_indicators')
      .select('key,label,value,unit,location,observed_on,source').in('key', keys).order('observed_on', { ascending: false }).limit(500);
    if (error) { console.error('getPriceCompare', error.message); return { town: COMPARE_TOWNS[0], rows: [] }; }
    rows = ((data ?? []) as Indicator[]).map((r) => ({ ...r, value: Number(r.value) }));
  }
  const latest = (s: { key: string; location: string }): PriceSide | undefined => {
    const r = rows.filter((x) => x.key === s.key && x.location === s.location).sort((x, y) => y.observed_on.localeCompare(x.observed_on))[0];
    return r && { place: s.location, value: r.value, unit: r.unit, date: r.observed_on, source: r.source };
  };
  const build = (town: string) => PRICE_COMPARE.map((p) => ({ label: p.label, note: p.note, a: latest(p.a), b: latest({ key: p.townKey, location: town }) }));
  const start = rotationIndex(mmtToday());
  for (let k = 0; k < COMPARE_TOWNS.length; k++) {
    const town = COMPARE_TOWNS[(start + k) % COMPARE_TOWNS.length];
    const rows = build(town);
    if (rows.slice(0, 3).filter((r) => r.b).length >= 2) return { town, rows };
  }
  return { town: COMPARE_TOWNS[0], rows: build(COMPARE_TOWNS[0]) };
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
