import { getSectionEntries, type SectionEntry } from './data';
import { supabaseRead } from './supabase';

export type FocusKey = 'scam-centres' | 'critical-minerals' | 'drugs';

export interface FocusTopic { key: FocusKey; name: string; short: string; intro: string; match: RegExp }

export const FOCUS: FocusTopic[] = [
  {
    key: 'scam-centres', name: 'Scam Centres',
    short: 'Online fraud compounds on Myanmar’s borders, the people trafficked into them and the armed groups that protect them.',
    intro: 'Scam compounds on the Thai and Chinese borders run industrial-scale online fraud, staffed largely by trafficked workers. Armed groups and militias rent out land and sell protection, so the industry is also a revenue stream in the war. Raids and repatriations move the business rather than end it: compounds relocate, and the money keeps flowing through crypto and informal channels.',
    match: /scam|fraud|kk park|shwe kokko|casino|cyber/i,
  },
  {
    key: 'critical-minerals', name: 'Rare Earths & Critical Minerals',
    short: 'Rare earths, tin and other minerals mined in conflict zones, mostly for China, and who controls and taxes them.',
    intro: 'Myanmar is one of the world’s largest sources of heavy rare earths, most of them mined in Kachin and Shan areas held by armed groups and exported to China. Control of mines and border routes has become a prize in the war, and a growing interest for China, India and the West.',
    match: /rare.earth|critical mineral|mining|jade|antimony/i,
  },
  {
    key: 'drugs', name: 'Drugs & Illicit Economy',
    short: 'Methamphetamine, opium and heroin from the Golden Triangle, and the wider illicit economy around them.',
    intro: 'Shan State remains the centre of the Golden Triangle drug trade, producing methamphetamine, heroin and ketamine on a regional scale. Opium farming has spread as the legal economy has shrunk, and drug money is tied up with militias, checkpoints and the wider war economy.',
    match: /drug|meth|opium|heroin|yaba|ketamine|narcotic|poppy/i,
  },
];

export const isFocus = (k: string): k is FocusKey => FOCUS.some((t) => t.key === k);

export interface FocusItem {
  topic: FocusKey; kind: 'report' | 'figure'; title: string; value: string | null;
  org: string; url: string | null; published_on: string | null; summary: string | null; sort: number;
}

export const byDate = (a: FocusItem, b: FocusItem) => (b.published_on ?? '').localeCompare(a.published_on ?? '');
export const fmtDate = (d: string | null) => d ? new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';

/** Key figures and outside reports for the In Focus pages (table monitor_focus). */
export async function getFocusItems(topic?: FocusKey): Promise<FocusItem[]> {
  const db = supabaseRead();
  if (!db) return [];
  let q = db.from('monitor_focus').select('topic,kind,title,value,org,url,published_on,summary,sort').order('sort');
  if (topic) q = q.eq('topic', topic);
  const { data, error } = await q;
  if (error) { console.error('getFocusItems', error.message); return []; }
  return (data ?? []) as FocusItem[];
}

/** Items from our own daily and weekly posts that mention the topic. */
export async function getFocusCoverage(t: FocusTopic, limit = 12): Promise<SectionEntry[]> {
  const entries = await getSectionEntries(200);
  return entries.filter((e) => t.match.test(`${e.value ?? ''} ${e.label ?? ''} ${e.text_md}`)).slice(0, limit);
}
