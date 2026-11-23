// Home-page "Key indicators": one card per area, each with up to 3 highlight figures.
// An item is a tracked figure (latest value + change) or a row from a status board.
// Cards (Option A, Zaw 23 Nov): 3 bullets per area — value + `label` (keep it to ~35 characters), then one small grey line. `short` is kept for compact uses.
import type { CategoryKey } from './types';

export type HighlightDef =
  | { kind: 'figure'; key: string; location?: string; label: string; short: string; upIsBad: boolean }
  | { kind: 'status'; board: 'trade' | 'hotspot'; name: string }
  /** The most recently updated rows of a status board, so new reports show up without editing this file. */
  | { kind: 'latest'; board: 'trade' | 'hotspot'; count: number };

export const HIGHLIGHTS: Record<CategoryKey, HighlightDef[]> = {
  prices: [
    { kind: 'figure', key: 'palm_oil', location: 'Yangon', label: 'Palm oil, Yangon, a viss', short: 'Palm oil, Ygn', upIsBad: true },
    { kind: 'figure', key: 'petrol_local', location: 'Ayeyarwady', label: 'Petrol, Ayeyarwady, a litre', short: 'Petrol, delta', upIsBad: true },
    { kind: 'figure', key: 'fertiliser', location: 'Rakhine', label: 'Fertiliser, Arakan, a sack', short: 'Fertiliser, Arakan', upIsBad: true },
  ],
  trade: [
    { kind: 'latest', board: 'trade', count: 3 },
  ],
  business: [
    { kind: 'figure', key: 'power_demand_met', label: 'Hot-season power demand met', short: 'Power demand met', upIsBad: false },
    { kind: 'figure', key: 'oil_wells_destroyed', location: 'Magway', label: 'Small oil wells destroyed, Magway', short: 'Oil wells destroyed', upIsBad: true },
    { kind: 'figure', key: 'garment_closure_applications', label: 'Garment factories applying to close (at least)', short: 'Garment closures', upIsBad: true },
  ],
  money: [
    { kind: 'figure', key: 'mmk_usd_street', label: 'Kyat per US$, street (DVB)', short: 'Street rate $', upIsBad: true },
    { kind: 'figure', key: 'mmk_usd_official', label: 'Kyat per US$, official', short: 'Official rate $', upIsBad: true },
    { kind: 'figure', key: 'mmk_usd_remittance_banks', label: 'Kyat per US$, remittance (official)', short: 'Remittance rate $', upIsBad: false },
  ],
  conflict: [
    { kind: 'figure', key: 'checkpoint_fee_person', location: 'Shwe Kokko', label: 'Shwe Kokko fee per person moved', short: 'Shwe Kokko fee', upIsBad: true },
    { kind: 'figure', key: 'conscription_levy', location: 'Kyonpyaw', label: 'Conscription levy per household, Kyonpyaw', short: 'Kyonpyaw levy', upIsBad: true },
    { kind: 'figure', key: 'market_sales_change', location: 'Kyauktaw', label: 'Kyauktaw market sales since airstrike', short: 'Kyauktaw sales', upIsBad: false },
  ],
};
