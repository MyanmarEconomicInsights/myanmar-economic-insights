import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories';
import { SITE_ALT_NAME, SITE_NAME, SITE_SHORT } from '@/lib/site';
import { CAT_MY, getLang } from '@/lib/i18n';

export const metadata = { title: 'About' };

export default async function About() {
  if ((await getLang()) === 'my') return (
    <div className="panel prose" style={{ maxWidth: 780, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>အကြောင်း</h1>
      <p>{SITE_NAME} ({SITE_SHORT}) သည် ပြည်သူများနှင့် လုပ်ငန်းများ လက်တွေ့ကြုံတွေ့နေရသော မြန်မာ့စီးပွားရေးကို စောင့်ကြည့်ပါသည်။ နေ့စဉ် အကျဉ်းချုပ်တစ်ခု တင်ပြီး အပတ်စဉ် စီးပွားရေး (Business Weekly) ကို သောကြာနေ့တိုင်း ထုတ်ဝေပါသည်။</p>
      <p>MEI သည် Myanmar Policy Institute (MPI) ၏ AI အသုံးပြုထားသော စမ်းသပ်စီမံကိန်း ဖြစ်ပါသည်။ ဤမြန်မာဘာသာ ဗားရှင်းသည် Beta ဖြစ်ပြီး AI ဖြင့် ဘာသာပြန်ထားပါသည်။</p>
      <p>သတင်းအချက်အလက်များကို ကဏ္ဍ ငါးခုဖြင့် စီစဉ်ထားပါသည်:</p>
      <ul>{CATEGORY_ORDER.map((k) => <li key={k}><strong>{CAT_MY[k].name}။</strong> {CAT_MY[k].about}</li>)}</ul>
      <p>နေ့စဉ်အကျဉ်းချုပ်နှင့် အပတ်စဉ်ထုတ်တိုင်းတွင် ကဏ္ဍတစ်ခုစီအတွက် ခေါင်းစီးကိန်းဂဏန်း တစ်ခုစီနှင့် အဘယ်ကြောင့် ပြောင်းလဲသည်ကို အတိုချုပ် ဖော်ပြပါသည်။</p>
      <p>ကိန်းဂဏန်းတိုင်းကို ရင်းမြစ်အမည်နှင့် ရက်စွဲဖြင့် ဖော်ပြပါသည်။ ရင်းမြစ်မရှိသော ကိန်းဂဏန်းကို ခန့်မှန်းမဖော်ပြဘဲ ချန်လှပ်ထားပါသည်။</p>
    </div>
  );
  return (
    <div className="panel prose" style={{ maxWidth: 780, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>About</h1>
      <p>{SITE_NAME} ({SITE_SHORT}), also published as {SITE_ALT_NAME}, tracks Myanmar&rsquo;s economy as people and businesses experience it. A short summary is posted each day, and the Business Weekly comes out every Friday.</p>
      <p>MEI is an AI-powered pilot project of the Myanmar Policy Institute (MPI). A Burmese (Myanmar-language) version is now in Beta at <a href="/my" data-lang-switch>/my</a>.</p>
      <p>Coverage is organised into five categories:</p>
      <ul>{CATEGORY_ORDER.map((k) => <li key={k}><strong>{CATEGORIES[k].name}.</strong> {CATEGORIES[k].about}</li>)}</ul>
      <p>Each daily summary and weekly issue gives one headline number for each area, with a short note on why it moved.</p>
      <p>Every figure is published with a named source and date. When a figure can&rsquo;t be sourced, it is left out rather than estimated.</p>
    </div>
  );
}
