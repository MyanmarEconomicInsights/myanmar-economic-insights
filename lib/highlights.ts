// The key-indicator tiles on the home page. Each tile shows the latest sourced value of one tracked
// item (key + location). `upIsBad` sets the colour of the change arrow.
export interface TileDef { key: string; location?: string; label: string; upIsBad: boolean }

export const HOME_TILES: TileDef[] = [
  { key: 'mmk_usd_street', label: 'Kyat per US$ (street, DVB)', upIsBad: true },
  { key: 'mmk_usd_official', label: 'Kyat per US$ (official)', upIsBad: true },
  { key: 'palm_oil', location: 'Yangon', label: 'Palm oil, Yangon (viss)', upIsBad: true },
  { key: 'petrol_local', location: 'Ayeyarwady', label: 'Petrol, Ayeyarwady (litre)', upIsBad: true },
  { key: 'fertiliser', location: 'Rakhine', label: 'Fertiliser, Arakan (sack)', upIsBad: true },
  { key: 'defence_budget_request', label: 'Defence budget request 2026–27', upIsBad: true },
];
