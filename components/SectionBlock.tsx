import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import type { Section } from '@/lib/types';
import CategoryTag from './CategoryTag';
import Markdown from './Markdown';
import SourceLink from './SourceLink';

export default function SectionBlock({ s }: { s: Section }) {
  return (
    <section className="sec" style={{ borderLeftColor: `var(--cat-${s.category})` }}>
      <div className="sec-head">
        <CategoryTag k={s.category} />
        <Link className="sec-link" href={`/c/${CATEGORIES[s.category].slug}`}>More {CATEGORIES[s.category].short.toLowerCase()} →</Link>
      </div>
      {(s.value || s.label) && (
        <div className="sec-num"><b>{s.value}</b> <span>{s.label}</span></div>
      )}
      <Markdown>{s.text_md}</Markdown>
      {s.source && <div className="src">Source: <SourceLink name={s.source} url={s.source_url} /></div>}
    </section>
  );
}
