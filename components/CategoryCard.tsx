import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import type { SectionEntry } from '@/lib/data';
import type { CategoryKey } from '@/lib/types';
import CategoryTag from './CategoryTag';
import Markdown from './Markdown';
import { shortDate } from './util';

export default function CategoryCard({ k, entry }: { k: CategoryKey; entry?: SectionEntry }) {
  const c = CATEGORIES[k];
  return (
    <section className="desk" style={{ borderTopColor: `var(--cat-${k})` }}>
      <CategoryTag k={k} />
      {entry ? (
        <>
          {entry.value && <div className="val">{entry.value}</div>}
          {entry.label && <div className="lbl">{entry.label}</div>}
          <div className="desk-text"><Markdown>{entry.text_md}</Markdown></div>
          <div className="src">
            {entry.source && <>{entry.source} · </>}
            <Link href={`/p/${entry.post.slug}`}>{entry.post.kind === 'weekly' ? 'Weekly' : 'Daily'}, {shortDate(entry.post.period_end ?? entry.post.published_at)}</Link>
          </div>
        </>
      ) : (
        <p className="lbl">{c.about}</p>
      )}
      <Link className="more" href={`/c/${c.slug}`}>All {c.short.toLowerCase()} updates →</Link>
    </section>
  );
}
