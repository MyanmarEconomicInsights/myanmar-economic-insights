// Burmese (Myanmar-language) version, Beta (Nov 2026).
// /my/... URLs are rewritten by proxy.ts to the same pages with the header x-mei-lang: my.
// Server components call getLang() / getT(); content translations live in Supabase table monitor_i18n.
import { headers } from 'next/headers';
import type { CategoryKey } from './types';

export type Lang = 'en' | 'my';

export async function getLang(): Promise<Lang> {
  const h = await headers();
  return h.get('x-mei-lang') === 'my' ? 'my' : 'en';
}

/** Prefix an internal path for the current language ('/daily' → '/my/daily'). */
export const lp = (lang: Lang, path: string) => (lang === 'my' ? (path === '/' ? '/my' : `/my${path}`) : path);

const EN = {
  nav_daily: 'Daily', nav_weekly: 'Business Weekly', nav_focus: 'In Focus', nav_data: 'Data', nav_about: 'About',
  tagline: 'Daily and weekly tracking of prices, trade, business, money and the conflict economy.',
  footer_main: 'MEI is an AI-powered pilot project of the Myanmar Policy Institute (MPI). Summaries are compiled with AI, with about 20–30% human review and editing. Every figure is published with a named source and date; please check the original source before relying on it.',
  footer_beta: 'A Burmese (Myanmar-language) version is now in Beta.',
  feedback_link: 'Suggest a topic or report an error',
  beta_banner: '',
  daily_summary: 'Daily summary', business_weekly: 'Business Weekly', daily: 'Daily',
  key_indicators: 'Key indicators by area',
  kyat_week: 'The kyat, week by week', kyat_week_kicker: 'Street rate per US dollar, last DVB reading of each week',
  prices_vs: 'Prices: Yangon vs', prices_kicker: 'Latest reading of each item; each pair has its own scale', all_prices: 'All prices and places →',
  routes_title: 'Border and sea routes', routes_kicker: 'Status now vs 4 weeks ago', all_routes: 'All routes and border gates →',
  todays_daily: 'Today’s daily summary', daily_soon: 'Daily summaries start soon.', prev_daily: 'Previous daily summaries →',
  latest_weekly: 'Latest Business Weekly', read_issue: 'Read the issue →',
  pick_day: 'Pick a day', pick_day_note: 'Dark days have a daily summary; light days have a weekly issue or new figures. Dates are Myanmar time.', all_daily: 'All daily summaries →',
  week_by_week: 'Week by week: the headline number in each area', all_issues: 'All issues →',
  board_trade: 'Trade routes and border gates', board_hotspot: 'Economic pressure points',
  all_routes_gates: 'All routes and gates', all_points: 'All pressure points',
  explore: 'Explore the data', explore_lbl: 'Search, filter, sort and download every figure we track, updated daily.', open_data: 'Open the data →',
  official_note: (off: string, src: string, pct: number) => `Official reference rate K${off} (${src}). The street rate is ${pct}% higher. Other trackers are in`, the_data: 'the data',
  daily_h1: 'Daily summaries', daily_dek: "A short read on each day's Myanmar economic news. Dates are Myanmar time.",
  nothing_yet: 'Nothing published yet.', daily_pick_note: 'Pick a day to see its daily summary, the weekly issue that covers it and any figures recorded that day.',
  weekly_dek: 'The weekly issue: one headline number for each of the five categories.',
  sources: 'Sources', source: 'Source', spotted: 'Spotted an error?', report_it: 'Report it', everything_day: 'Everything from this day',
  more_cat: (s: string) => `More ${s.toLowerCase()} →`, english_only: '',
  latest_figures: 'Latest tracked figures', search_cat: (s: string) => `Search, sort and download all ${s.toLowerCase()} data →`,
  updates: 'Updates', full_summary: 'Full summary →', no_updates: 'No updates in this category yet.', kyat: 'Kyat',
  sources_detail: 'Sources and detail →', no_fig: 'No sourced figure yet.', since: 'since', updated: 'updated', see_all: 'See all',
  week: 'Week', route: 'Route', now: 'Now', no_data: '— no data', no_data_yet: 'no data yet',
  item: 'Item', where: 'Where', latest: 'Latest', unit: 'Unit', date: 'Date', national: 'National', no_tracked: 'No tracked figures yet.',
  diff_dates: ' · readings on different dates', diff_units: 'Different units, not compared', lower: 'lower',
  in_focus: 'In Focus', latest_rep: 'Latest', reports_soon: 'Reports coming soon',
  about: 'About',
};
type Dict = typeof EN;

const MY: Dict = {
  nav_daily: 'နေ့စဉ်', nav_weekly: 'အပတ်စဉ် စီးပွားရေး', nav_focus: 'အထူးအာရုံစိုက်', nav_data: 'ဒေတာ', nav_about: 'အကြောင်း',
  tagline: 'ဈေးနှုန်း၊ ကုန်သွယ်ရေး၊ စီးပွားရေးလုပ်ငန်း၊ ငွေကြေးနှင့် ပဋိပက္ခစီးပွားရေးကို နေ့စဉ်နှင့် အပတ်စဉ် စောင့်ကြည့်ခြင်း။',
  footer_main: 'MEI သည် Myanmar Policy Institute (MPI) ၏ AI အသုံးပြုထားသော စမ်းသပ်စီမံကိန်းတစ်ခု ဖြစ်ပါသည်။ အကျဉ်းချုပ်များကို AI ဖြင့် ပြုစုပြီး လူက ၂၀–၃၀% ခန့် စိစစ်တည်းဖြတ်ပါသည်။ ကိန်းဂဏန်းတိုင်းကို ရင်းမြစ်အမည်နှင့် ရက်စွဲဖြင့် ဖော်ပြထားပါသည်။ အသုံးမပြုမီ မူရင်းရင်းမြစ်ကို ပြန်လည်စစ်ဆေးပါ။',
  footer_beta: 'ဤမြန်မာဘာသာ ဗားရှင်းသည် Beta (စမ်းသပ်ဆဲ) ဖြစ်ပြီး AI ဖြင့် ဘာသာပြန်ထားသဖြင့် အမှားများ ပါနိုင်ပါသည်။ ကိန်းဂဏန်းနှင့် ရင်းမြစ်အမည်များကို မူရင်းအတိုင်း ထားပါသည်။',
  feedback_link: 'အကြောင်းအရာ အကြံပြုရန် သို့မဟုတ် အမှားသတင်းပို့ရန်',
  beta_banner: 'မြန်မာဘာသာ Beta — ဘာသာပြန်မထားရသေးသော အကြောင်းအရာများကို အင်္ဂလိပ်ဘာသာဖြင့် ပြသထားပါသည်။',
  daily_summary: 'နေ့စဉ် အကျဉ်းချုပ်', business_weekly: 'အပတ်စဉ် စီးပွားရေး', daily: 'နေ့စဉ်',
  key_indicators: 'ကဏ္ဍအလိုက် အဓိက ညွှန်ကိန်းများ',
  kyat_week: 'ကျပ်ငွေ — အပတ်စဉ်', kyat_week_kicker: 'အမေရိကန်ဒေါ်လာ ၁ ဒေါ်လာ ပြင်ပဈေး၊ အပတ်စဉ် နောက်ဆုံး DVB ဈေးနှုန်း',
  prices_vs: 'ဈေးနှုန်း: ရန်ကုန်နှင့်', prices_kicker: 'ပစ္စည်းတစ်ခုစီ၏ နောက်ဆုံးဈေး၊ အတွဲတစ်ခုစီ စကေးမတူပါ', all_prices: 'ဈေးနှုန်းနှင့် နေရာအားလုံး →',
  routes_title: 'နယ်စပ်နှင့် ပင်လယ်လမ်းကြောင်းများ', routes_kicker: 'ယခု အခြေအနေနှင့် ၄ ပတ်အကြို နှိုင်းယှဉ်ချက်', all_routes: 'လမ်းကြောင်းနှင့် နယ်စပ်ဂိတ်အားလုံး →',
  todays_daily: 'ယနေ့ နေ့စဉ် အကျဉ်းချုပ်', daily_soon: 'နေ့စဉ်အကျဉ်းချုပ်များ မကြာမီ စတင်ပါမည်။', prev_daily: 'ယခင် နေ့စဉ်အကျဉ်းချုပ်များ →',
  latest_weekly: 'နောက်ဆုံး အပတ်စဉ် စီးပွားရေး', read_issue: 'ဖတ်ရှုရန် →',
  pick_day: 'ရက်ရွေးရန်', pick_day_note: 'အရောင်ရင့်ရက်များတွင် နေ့စဉ်အကျဉ်းချုပ်ရှိပြီး အရောင်ဖျော့ရက်များတွင် အပတ်စဉ်ထုတ် သို့မဟုတ် ကိန်းဂဏန်းအသစ်ရှိပါသည်။ ရက်စွဲများမှာ မြန်မာစံတော်ချိန် ဖြစ်ပါသည်။', all_daily: 'နေ့စဉ်အကျဉ်းချုပ် အားလုံး →',
  week_by_week: 'အပတ်စဉ်: ကဏ္ဍတစ်ခုစီ၏ ခေါင်းစီးကိန်းဂဏန်း', all_issues: 'ထုတ်ဝေမှု အားလုံး →',
  board_trade: 'ကုန်သွယ်ရေးလမ်းကြောင်းနှင့် နယ်စပ်ဂိတ်များ', board_hotspot: 'စီးပွားရေး ဖိအားပေးနေရာများ',
  all_routes_gates: 'လမ်းကြောင်းနှင့် ဂိတ်အားလုံး', all_points: 'ဖိအားပေးနေရာ အားလုံး',
  explore: 'ဒေတာ ရှာဖွေရန်', explore_lbl: 'ကျွန်ုပ်တို့ စောင့်ကြည့်သော ကိန်းဂဏန်းတိုင်းကို ရှာဖွေ၊ စစ်ထုတ်၊ စီပြီး ဒေါင်းလုဒ်ဆွဲနိုင်ပါသည်။ နေ့စဉ် အသစ်ပြင်ပါသည်။', open_data: 'ဒေတာ ဖွင့်ရန် →',
  official_note: (off: string, src: string, pct: number) => `တရားဝင် ရည်ညွှန်းနှုန်း K${off} (${src})။ ပြင်ပဈေးသည် ${pct}% ပိုမြင့်ပါသည်။ အခြား ညွှန်ကိန်းများကို ကြည့်ရန်`, the_data: 'ဒေတာ',
  daily_h1: 'နေ့စဉ် အကျဉ်းချုပ်များ', daily_dek: 'မြန်မာ့စီးပွားရေးသတင်းကို နေ့စဉ် အတိုချုပ်ဖတ်ရန်။ ရက်စွဲများမှာ မြန်မာစံတော်ချိန် ဖြစ်ပါသည်။',
  nothing_yet: 'မထုတ်ဝေရသေးပါ။', daily_pick_note: 'ရက်တစ်ရက်ကို ရွေးပြီး ထိုနေ့၏ အကျဉ်းချုပ်၊ ထိုနေ့ပါဝင်သော အပတ်စဉ်ထုတ်နှင့် ထိုနေ့တွင် မှတ်တမ်းတင်ထားသော ကိန်းဂဏန်းများကို ကြည့်ပါ။',
  weekly_dek: 'အပတ်စဉ်ထုတ်: ကဏ္ဍ ငါးခုစီအတွက် ခေါင်းစီးကိန်းဂဏန်း တစ်ခုစီ။',
  sources: 'ရင်းမြစ်များ', source: 'ရင်းမြစ်', spotted: 'အမှားတွေ့ပါသလား။', report_it: 'သတင်းပို့ရန်', everything_day: 'ဤနေ့မှ အရာအားလုံး',
  more_cat: (s: string) => `${s} နောက်ထပ် →`, english_only: 'ဤစာမျက်နှာကို မြန်မာဘာသာသို့ မပြန်ရသေးပါ။ အင်္ဂလိပ်ဘာသာဖြင့် ပြသထားပါသည်။',
  latest_figures: 'နောက်ဆုံး ကိန်းဂဏန်းများ', search_cat: (s: string) => `${s} ဒေတာအားလုံးကို ရှာဖွေ၊ စီ၊ ဒေါင်းလုဒ်ဆွဲရန် →`,
  updates: 'နောက်ဆုံးရ အချက်အလက်များ', full_summary: 'အကျဉ်းချုပ် အပြည့်အစုံ →', no_updates: 'ဤကဏ္ဍတွင် အချက်အလက်သစ် မရှိသေးပါ။', kyat: 'ကျပ်ငွေ',
  sources_detail: 'ရင်းမြစ်နှင့် အသေးစိတ် →', no_fig: 'ရင်းမြစ်ရှိသော ကိန်းဂဏန်း မရှိသေးပါ။', since: 'မှစ၍', updated: 'နောက်ဆုံးပြင်', see_all: 'အားလုံးကြည့်ရန်',
  week: 'အပတ်', route: 'လမ်းကြောင်း', now: 'ယခု', no_data: '— ဒေတာမရှိ', no_data_yet: 'ဒေတာ မရှိသေး',
  item: 'ပစ္စည်း', where: 'နေရာ', latest: 'နောက်ဆုံး', unit: 'ယူနစ်', date: 'ရက်စွဲ', national: 'တစ်နိုင်ငံလုံး', no_tracked: 'စောင့်ကြည့်ထားသော ကိန်းဂဏန်း မရှိသေးပါ။',
  diff_dates: ' · ရက်စွဲမတူသော ဈေးနှုန်းများ', diff_units: 'ယူနစ်မတူသဖြင့် နှိုင်းယှဉ်မထားပါ', lower: 'ပိုနိမ့်',
  in_focus: 'အထူးအာရုံစိုက်', latest_rep: 'နောက်ဆုံး', reports_soon: 'အစီရင်ခံစာများ မကြာမီ',
  about: 'အကြောင်း',
};

export async function getT(): Promise<Dict & { lang: Lang }> {
  const lang = await getLang();
  return { ...(lang === 'my' ? MY : EN), lang };
}

/** Category names and descriptions in Burmese. */
export const CAT_MY: Record<CategoryKey, { name: string; short: string; about: string; tracks: string[] }> = {
  prices: {
    name: 'ဈေးနှုန်း', short: 'ဈေးနှုန်း',
    about: 'ရန်ကုန်၊ မန္တလေးနှင့် ပဋိပက္ခဒဏ်ခံရသော မြို့များရှိ အိမ်သုံးကုန်ပစ္စည်း ပုံသေစာရင်းကို စောင့်ကြည့်ပြီး ဈေးနှုန်းများ အဘယ်ကြောင့် ပြောင်းလဲသည်ကို ဖော်ပြသည်။',
    tracks: ['ဆန်၊ စားသုံးဆီ၊ ကြက်ဥ၊ ကြက်သား၊ ကြက်သွန်နီ၊ လောင်စာဆီ', 'ရန်ကုန်၊ မန္တလေးနှင့် ကရင်၊ ရှမ်း၊ အညာ၊ ရခိုင် သို့မဟုတ် ကချင်ရှိ မြို့များ', 'ဈေးပြောင်းရသည့် အကြောင်းရင်း (လမ်းပိတ်ခြင်း၊ ဂိတ်ပိတ်ခြင်း၊ ကျပ်ငွေ)'],
  },
  trade: {
    name: 'ကုန်သွယ်ရေးနှင့် ထောက်ပံ့ရေးကွင်းဆက်', short: 'ကုန်သွယ်ရေး',
    about: 'ကုန်စည်များ စီးဆင်းနေသလား။ နယ်စပ်ဂိတ်များ ဖွင့်/ကန့်သတ်/ပိတ် အခြေအနေ၊ ပင်လယ်ဆိပ်ကမ်းနှင့် ကမ်းရိုးတန်း သင်္ဘောလမ်းကြောင်းများ၊ တရုတ်၊ ထိုင်း၊ အိန္ဒိယနှင့် ဘင်္ဂလားဒေ့ရှ်မှ တင်သွင်းမှုများ။',
    tracks: ['နယ်စပ်ဂိတ် အခြေအနေ (မူဆယ်၊ မြဝတီ၊ တမူး၊ ရနောင်း၊ မောင်တော–တက်နာ့ဖ် စသည်)', 'ပင်လယ်လမ်းကြောင်း: သီလဝါအပါအဝင် ရန်ကုန်ဆိပ်ကမ်းများ၊ စစ်တွေ၊ ကျောက်ဖြူ၊ ကော့သောင်း–ရနောင်း', 'သွင်းကုန်၊ ပို့ကုန်နှင့် မြို့ကြီးဈေးများတွင် ပြတ်လပ်မှု', 'လမ်းပိတ်ခြင်း၊ ကုန်တင်ယာဉ်နှင့် လက်နက်ကိုင်အဖွဲ့များ၏ ကုန်သွယ်ရေးအခွန်ကောက်ခံမှု'],
  },
  business: {
    name: 'စီးပွားရေး ဝန်းကျင်', short: 'စီးပွားရေး',
    about: 'လုပ်ငန်းများ လိုက်လျောညီထွေ ပြောင်းလဲနေသလား၊ ကျုံ့နေသလား၊ ထွက်ခွာနေသလား။ တရားဝင်ကုမ္ပဏီများနှင့် စီးပွားရေး၏ အများစုကို ပြုလုပ်နေသော အလွတ်သဘော ကုန်သည်များ။',
    tracks: ['ကုမ္ပဏီမှတ်ပုံတင်မှုနှင့် DICA / နိုင်ငံခြားရင်းနှီးမြှုပ်နှံမှု ဒေတာ', 'ထွက်ခွာမှု၊ စက်ရုံပိတ်မှုနှင့် ပြောင်းရွှေ့မှု', 'အသေးစား ကုန်သည်၊ ဈေးဆိုင်ခန်းနှင့် အိမ်တွင်းလုပ်ငန်းများ'],
  },
  money: {
    name: 'ငွေကြေးနှင့် ဘဏ်လုပ်ငန်း', short: 'ငွေကြေး',
    about: 'ကျပ်ငွေ၊ ငွေသားနှင့် ပြည်သူများ အားကိုးနေရသော ဘဏ်ပြင်ပ နည်းလမ်းများ၊ ဘဏ်လုပ်ငန်း သို့မဟုတ် နိုင်ငံခြားငွေနှင့် ပတ်သက်သော စစ်ကောင်စီ ညွှန်ကြားချက်တိုင်း။',
    tracks: ['တရားဝင်နှုန်းနှင့် ပြင်ပဈေး', 'ATM ငွေသား၊ မိုဘိုင်းငွေ ကန့်သတ်ချက်၊ ဟွန်ဒီနှင့် crypto', 'ငွေလွှဲပို့မှုနှင့် ၂၅% လဲလှယ်ရမည့် စည်းမျဉ်း'],
  },
  conflict: {
    name: 'ပဋိပက္ခနှင့် တရားမဝင် လုပ်ဆောင်မှုများ', short: 'ပဋိပက္ခ',
    about: 'ပဋိပက္ခသည်ပင် စီးပွားရေးဝန်းကျင် ဖြစ်နေသည်: ဂိတ်ကြေးနှင့် အိမ်ထောင်စုအလိုက် ကောက်ခံငွေ၊ ပိတ်ဆို့မှု၊ ဈေးပိတ်မှု၊ စစ်ပွဲ၏ ကုန်ကျစရိတ်နှင့် မူးယစ်ဆေး၊ အွန်လိုင်းလိမ်လည်ရေးစခန်း စသည့် တရားမဝင် လုပ်ဆောင်မှုများကို ကျပ်/ဒေါ်လာဖြင့်။',
    tracks: ['လက်နက်ကိုင်အဖွဲ့များ၏ ဂိတ်ကြေး၊ အိမ်ထောင်စုကောက်ခံငွေနှင့် နှစ်ထပ်သုံးထပ် အခွန်', 'ပိတ်ဆို့မှု၊ ဈေးပိတ်မှုနှင့် စွန့်ပစ်ထားရသော လယ်ယာမြေ', 'မူးယစ်ဆေး၊ လိမ်လည်ရေးစခန်းနှင့် အခြား တရားမဝင်လုပ်ငန်းများ (အထူးအာရုံစိုက်တွင် အသေးစိတ်)'],
  },
};

/** Short fixed labels (home cards, price and route panels). Unknown text falls back to English. */
const WORDS: Record<string, string> = {
  'Palm oil, Yangon, a viss': 'စားအုန်းဆီ၊ ရန်ကုန်၊ တစ်ပိဿာ',
  'Petrol, Ayeyarwady, a litre': 'ဓာတ်ဆီ၊ ဧရာဝတီ၊ တစ်လီတာ',
  'Fertiliser, Arakan, a sack': 'ဓာတ်မြေဩဇာ၊ ရခိုင်၊ တစ်အိတ်',
  'Hot-season power demand met': 'နွေရာသီ လျှပ်စစ်လိုအပ်ချက် ဖြည့်ဆည်းနိုင်မှု',
  'Small oil wells destroyed, Magway': 'ဖျက်ဆီးခံရသော ရေနံတွင်းငယ်များ၊ မကွေး',
  'Garment factories applying to close (at least)': 'ပိတ်သိမ်းရန် လျှောက်ထားသော အထည်ချုပ်စက်ရုံ (အနည်းဆုံး)',
  'Kyat per US$, street (DVB)': 'ဒေါ်လာဈေး၊ ပြင်ပ (DVB)',
  'Kyat per US$, official': 'ဒေါ်လာဈေး၊ တရားဝင်',
  'Kyat per US$, remittance (official)': 'ဒေါ်လာဈေး၊ ငွေလွှဲ (တရားဝင်)',
  Rice: 'ဆန်', coarse: 'ကြမ်း', Onions: 'ကြက်သွန်နီ', Fuel: 'လောင်စာဆီ', 'Cooking oil': 'စားသုံးဆီ',
  China: 'တရုတ်', Thailand: 'ထိုင်း', India: 'အိန္ဒိယ', Bangladesh: 'ဘင်္ဂလားဒေ့ရှ်', Sea: 'ပင်လယ်',
  Yangon: 'ရန်ကုန်', Sittwe: 'စစ်တွေ', Myitkyina: 'မြစ်ကြီးနား', Lashio: 'လားရှိုး', 'Hpa-An': 'ဘားအံ', Monywa: 'မုံရွာ', Kalay: 'ကလေး',
  'a viss': 'တစ်ပိဿာ', 'a litre': 'တစ်လီတာ', 'a sack': 'တစ်အိတ်', 'a bag': 'တစ်အိတ်', 'per viss': 'တစ်ပိဿာ', 'per litre': 'တစ်လီတာ', 'per sack': 'တစ်အိတ်', 'per bag': 'တစ်အိတ်',
  Open: 'ဖွင့်', Restricted: 'ကန့်သတ်', Serious: 'ပြင်းထန်', Closed: 'ပိတ်',
};
export const tw = (lang: Lang, s: string) => (lang === 'my' ? WORDS[s] ?? s : s);

/** In Focus topic names in Burmese. */
export const FOCUS_MY: Record<string, string> = {
  'scam-centres': 'အွန်လိုင်းလိမ်လည်ရေး စခန်းများ',
  'critical-minerals': 'ရှားပါးမြေနှင့် အရေးပါသော တွင်းထွက်များ',
  drugs: 'မူးယစ်ဆေးနှင့် တရားမဝင် စီးပွားရေး',
};
