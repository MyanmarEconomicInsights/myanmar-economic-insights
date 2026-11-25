import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { CAT_MY, getT } from '@/lib/i18n';
import type { Section } from '@/lib/types';
import CategoryTag from './CategoryTag';
import Markdown from './Markdown';
import SourceLink from './SourceLink';

export default async function SectionBlock({ s }: { s: Section }) {
  const t = await getT();
  const short = t.lang === 'my' ? CAT_MY[s.category].short : CATEGORIES[s.category].short;
  return (
    <section className="sec" style={{ borderLeftColor: `var(--cat-${s.category})` }}>
      <div className="sec-head">
        <CategoryTag k={s.category} />
        <Link className="sec-link" href={`/c/${CATEGORIES[s.category].slug}`}>{t.more_cat(short)}</Link>
      </div>
      {(s.value || s.label) && (
        <div className="sec-num"><b>{s.value}</b> <span>{s.label}</span></div>
      )}
      <Markdown>{s.text_md}</Markdown>
      {s.source && <div className="src">{t.source}: <SourceLink name={s.source} url={s.source_url} /></div>}
    </section>
  );
}
