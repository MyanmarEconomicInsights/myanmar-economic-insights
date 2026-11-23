import type { CategoryKey } from './types';

export const CATEGORIES: Record<CategoryKey, { name: string; short: string; slug: string; about: string; tracks: string[] }> = {
  prices: {
    name: 'The Price Desk', short: 'Prices', slug: 'prices',
    about: 'A fixed household basket tracked in Yangon, Mandalay and conflict-affected towns — and why prices moved.',
    tracks: ['Rice, cooking oil, eggs, chicken, onions, fuel', 'Yangon, Mandalay + Karen, Shan, Ah Nyar, Rakhine or Kachin towns', 'The cause behind each move (road closures, gate shutdowns, the kyat)'],
  },
  trade: {
    name: 'Trade & Supply Chain', short: 'Trade', slug: 'trade',
    about: 'Are goods moving? Border gates open, restricted or closed, sea ports and coastal shipping, and what is coming in from China, Thailand, India and Bangladesh.',
    tracks: ['Border gate status (Muse, Myawaddy, Tamu, Ranong, Maungdaw–Teknaf and others)', 'Sea routes: Yangon port terminals incl. Thilawa, Sittwe, Kyaukphyu, Kawthaung–Ranong and coastal shipping', 'Imports and exports, shortages in city markets', 'Road closures, trucking and armed-group taxation of trade'],
  },
  business: {
    name: 'Business Climate', short: 'Business', slug: 'business',
    about: 'Are businesses adapting, shrinking or leaving? Formal companies and the informal traders who make up most of the economy.',
    tracks: ['Company registrations and DICA / foreign investment data', 'Exits, factory closures and relocations', 'Small traders, market stalls and home-based businesses'],
  },
  money: {
    name: 'Money & Banking', short: 'Money', slug: 'money',
    about: 'The kyat, cash and the banking workarounds people rely on, and every junta directive touching banking or foreign exchange.',
    tracks: ['Official vs street exchange rate', 'ATM cash, mobile money limits, hundi and crypto', 'Remittances and the 25% conversion rule'],
  },
  conflict: {
    name: 'Conflict & Illicit Activities', short: 'Conflict', slug: 'conflict',
    about: 'The conflict is the business environment: checkpoint taxes and household levies, blockades, market shutdowns, the cost of the war, and illicit activity such as drugs and scam centres, in kyat and dollar terms.',
    tracks: ['Checkpoint fees, household levies and multiple taxation by armed actors', 'Blockades, market shutdowns and abandoned farmland', 'Drugs, scam centres and other illicit activity, valued in USD/MMK (deeper coverage in In Focus)'],
  },
};

export const CATEGORY_ORDER: CategoryKey[] = ['prices', 'trade', 'business', 'money', 'conflict'];
export const isCategory = (k: unknown): k is CategoryKey => CATEGORY_ORDER.includes(k as CategoryKey);
