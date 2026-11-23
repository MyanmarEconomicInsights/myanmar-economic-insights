// Home-page "Key indicators": one card per area, each with up to 3 highlight figures.
// An item is a tracked figure (latest value + change) or a row from a status board.
// Cards show ONE line per item (Zaw, 23 Nov: "3 short lines for each category"): keep `short` to ~18 characters; `label` is the full hover text.
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
    { kind: 'figure', key: 'garment_closure_applications', label: 'Garment factories applying to close this year (at least)', short: 'Garment closures', upIsBad: true },
  ],
  money: [
    { kind: 'figure', key: 'mmk_usd_street', label: 'Kyat per US$, street (DVB)', short: 'Street rate $', upIsBad: true },
    { kind: 'figure', key: 'mmk_usd_official', label: 'Kyat per US$, official', short: 'Official rate $', upIsBad: true },
    { kind: 'figure', key: 'mmk_usd_remittance_banks', label: 'Kyat per US$, remittance (official)', short: 'Remittance rate $', upIsBad: false },
  ],
  conflict: [
    { kind: 'figure', key: 'checkpoint_fee_person', location: 'Shwe Kokko', label: 'Checkpoint fee per person moved, Shwe Kokko', short: 'Shwe Kokko fee', upIsBad: true },
    { kind: 'figure', key: 'conscription_levy', location: 'Kyonpyaw', label: 'Conscription levy a household, Kyonpyaw', short: 'Kyonpyaw levy', upIsBad: true },
    { kind: 'figure', key: 'market_sales_change', location: 'Kyauktaw', label: 'Kyauktaw market sales since airstrike', short: 'Kyauktaw sales', upIsBad: false },
  ],
};
