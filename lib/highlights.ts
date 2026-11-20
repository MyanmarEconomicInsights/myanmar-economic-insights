// Home-page "Key indicators": one card per area, each with up to 3 highlight figures.
// An item is either a tracked figure (latest value + change) or a row from a status board.
import type { CategoryKey } from './types';

export type HighlightDef =
  | { kind: 'figure'; key: string; location?: string; label: string; upIsBad: boolean }
  | { kind: 'status'; board: 'trade' | 'hotspot'; name: string };

export const HIGHLIGHTS: Record<CategoryKey, HighlightDef[]> = {
  prices: [
    { kind: 'figure', key: 'palm_oil', location: 'Yangon', label: 'Palm oil, Yangon, a viss', upIsBad: true },
    { kind: 'figure', key: 'petrol_local', location: 'Ayeyarwady', label: 'Petrol, Ayeyarwady, a litre', upIsBad: true },
    { kind: 'figure', key: 'fertiliser', location: 'Rakhine', label: 'Fertiliser, Arakan, a sack', upIsBad: true },
  ],
  trade: [
    { kind: 'status', board: 'trade', name: 'Kyauktaw–India route' },
    { kind: 'status', board: 'trade', name: 'Myawaddy–Mae Sot' },
    { kind: 'figure', key: 'palm_oil_permits', label: 'Palm-oil import permits', upIsBad: false },
  ],
  business: [
    { kind: 'figure', key: 'power_demand_met', label: 'Hot-season power demand met', upIsBad: false },
    { kind: 'figure', key: 'oil_wells_destroyed', location: 'Magway', label: 'Small oil wells destroyed, Magway', upIsBad: true },
    { kind: 'figure', key: 'fdi_approved', label: 'Approved foreign investment, year to March 2026', upIsBad: false },
  ],
  money: [
    { kind: 'figure', key: 'mmk_usd_street', label: 'Kyat per US$, street (DVB)', upIsBad: true },
    { kind: 'figure', key: 'mmk_usd_official', label: 'Kyat per US$, official', upIsBad: true },
    { kind: 'figure', key: 'defence_budget_request', label: 'Defence budget request 2026–27', upIsBad: true },
  ],
  conflict: [
    { kind: 'figure', key: 'checkpoint_fee_person', location: 'Shwe Kokko', label: 'Checkpoint fee per person moved, Shwe Kokko', upIsBad: true },
    { kind: 'figure', key: 'conscription_levy', location: 'Kyonpyaw', label: 'Conscription levy a household, Kyonpyaw', upIsBad: true },
    { kind: 'figure', key: 'market_sales_change', location: 'Kyauktaw', label: 'Kyauktaw market sales since airstrike', upIsBad: false },
  ],
};
