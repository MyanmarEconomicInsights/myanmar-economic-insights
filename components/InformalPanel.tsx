import Link from 'next/link';
import { getLang } from '@/lib/i18n';

/** "How big is Myanmar's informal economy?" — sourced estimates, kept apart by what they measure. Figures checked 24 Nov 2026. */
const ROWS: { big: string; sub: string; text: string; src: string; check?: boolean }[] = [
  {
    big: '~50%', sub: 'of output',
    text: "Informal output was 49.6% of official GDP in 2020, by the World Bank's main model. A second model in the same database gives 22.1%, so estimates depend heavily on method.",
    src: 'World Bank Informal Economy Database (MIMIC and DGE models)',
  },
  {
    big: '8 in 10', sub: 'jobs',
    text: '79.9% of all employment was informal in 2019.',
    src: 'ILO, via the World Bank Informal Economy Database',
  },
  {
    big: '$50B?', sub: "a claim we're checking", check: true,
    text: 'A "$50 billion" figure circulates, but we can\'t find who calculated it. Half of 2025 GDP ($81.7B, World Bank) is about $41B, and at the street kyat rate the dollar total would be smaller still.',
    src: 'World Bank GDP 2025, current US$; our arithmetic',
  },
];

const ROWS_MY: typeof ROWS = [
  { big: '~50%', sub: 'ထုတ်လုပ်မှု၏', text: 'ကမ္ဘာ့ဘဏ်၏ အဓိက မော်ဒယ်အရ ၂၀၂၀ တွင် အလွတ်သဘော ထုတ်လုပ်မှုသည် တရားဝင် GDP ၏ ၄၉.၆% ရှိခဲ့သည်။ တူညီသော ဒေတာဘေ့စ်ရှိ ဒုတိယ မော်ဒယ်က ၂၂.၁% ဟု ဆိုသဖြင့် ခန့်မှန်းချက်များသည် နည်းလမ်းပေါ် များစွာ မူတည်သည်။', src: 'World Bank Informal Economy Database (MIMIC နှင့် DGE မော်ဒယ်များ)' },
  { big: '၁၀ ခုတွင် ၈ ခု', sub: 'အလုပ်အကိုင်', text: '၂၀၁၉ တွင် အလုပ်အကိုင် အားလုံး၏ ၇၉.၉% သည် အလွတ်သဘော ဖြစ်သည်။', src: 'ILO (World Bank Informal Economy Database မှတစ်ဆင့်)' },
  { big: '$50B?', sub: 'စစ်ဆေးနေဆဲ အဆို', check: true, text: '"ဒေါ်လာ ၅၀ ဘီလီယံ" ဟူသော ကိန်းဂဏန်း ပျံ့နှံ့နေသော်လည်း မည်သူ တွက်ချက်သည်ကို မတွေ့ရသေးပါ။ ၂၀၂၅ GDP ($81.7B, ကမ္ဘာ့ဘဏ်) ၏ တစ်ဝက်မှာ $41B ခန့်သာ ဖြစ်ပြီး ပြင်ပကျပ်ဈေးဖြင့် တွက်လျှင် ဒေါ်လာပမာဏ ပိုနည်းနိုင်သည်။', src: 'World Bank GDP 2025; ကျွန်ုပ်တို့၏ တွက်ချက်မှု' },
];

export default async function InformalPanel() {
  const my = (await getLang()) === 'my';
  const rows = my ? ROWS_MY : ROWS;
  return (
    <section className="panel inf" style={{ borderTop: '4px solid var(--cat-business)' }}>
      <p className="section-title" style={{ marginBottom: 2 }}>{my ? 'အလွတ်သဘော စီးပွားရေး' : 'Informal economy'}</p>
      <h3 className="inf-q">{my ? 'မြန်မာ့ အလွတ်သဘော စီးပွားရေး မည်မျှ ကြီးမားသနည်း။' : <>How big is Myanmar&rsquo;s informal economy?</>}</h3>
      {rows.map((r) => (
        <div className="inf-row" key={r.big}>
          <div className="inf-big">{r.big}<small>{r.sub}</small></div>
          <div className="inf-txt">
            {r.check && <><span className="pill pill-nd">{my ? 'ရင်းမြစ် မတွေ့ရသေး' : 'No source yet'}</span><br /></>}
            {r.text}
            <span className="inf-src">{r.src}</span>
          </div>
        </div>
      ))}
      <p className="note">{my ? 'ဤကိန်းဂဏန်းများသည် ၂၀၂၁ အာဏာသိမ်းမှု မတိုင်မီက ဖြစ်သည်။ ထို့နောက် ငွေသားသုံးစွဲမှု၊ ဟွန်ဒီနှင့် တရားဝင်ဂိတ်ပြင်ပ နယ်စပ်ကုန်သွယ်မှု တိုးလာဖွယ်ရှိသော်လည်း ခန့်မှန်းချက်အသစ် မရှိသေးပါ။ ' : 'These figures are from before the 2021 coup; cash use, hundi and border trade outside official gates have likely grown since, but no new estimate exists yet. '}<Link href="/c/business">{my ? 'စီးပွားရေးနှင့် အလွတ်သဘော စီးပွားရေး အကြောင်း နောက်ထပ် →' : 'More on business and the informal economy →'}</Link></p>
    </section>
  );
}
