import Link from 'next/link';

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

export default function InformalPanel() {
  return (
    <section className="panel inf" style={{ borderTop: '4px solid var(--cat-business)' }}>
      <p className="section-title" style={{ marginBottom: 2 }}>Informal economy</p>
      <h3 className="inf-q">How big is Myanmar&rsquo;s informal economy?</h3>
      {ROWS.map((r) => (
        <div className="inf-row" key={r.big}>
          <div className="inf-big">{r.big}<small>{r.sub}</small></div>
          <div className="inf-txt">
            {r.check && <><span className="pill pill-nd">No source yet</span><br /></>}
            {r.text}
            <span className="inf-src">{r.src}</span>
          </div>
        </div>
      ))}
      <p className="note">These figures are from before the 2021 coup; cash use, hundi and border trade outside official gates have likely grown since, but no new estimate exists yet. <Link href="/c/business">More on business and the informal economy →</Link></p>
    </section>
  );
}
