import Link from 'next/link';
import { CATEGORY_ORDER, CATEGORIES } from '@/lib/categories';
import type { Post } from '@/lib/types';
import { shortDate } from './util';

/** Week by week: one row per Business Weekly issue, one column per area (its headline number). */
export default function WeekTable({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <div className="table-wrap">
      <table className="weeks">
        <thead>
          <tr>
            <th>Week</th>
            {CATEGORY_ORDER.map((k) => (
              <th key={k}><span className="sw" style={{ background: `var(--cat-${k})` }} aria-hidden /> {CATEGORIES[k].short}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.slug}>
              <td className="wk">
                <Link href={`/p/${p.slug}`}>{p.title.split(':')[0]}</Link>
                <span>{p.period_start ? shortDate(p.period_start) + ' – ' : ''}{shortDate(p.period_end ?? p.published_at)}</span>
              </td>
              {CATEGORY_ORDER.map((k) => {
                const s = p.sections.find((x) => x.category === k);
                return (
                  <td key={k} title={s?.label ?? ''}>
                    {s?.value ? <><b>{s.value}</b><span className="wk-lbl">{s.label}</span></> : <span className="wk-none">—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
