import type { Post } from '@/lib/types';
import { longDate } from './util';

type P = Pick<Post, 'kind' | 'period_start' | 'period_end' | 'published_at'>;

export function periodLabel(p: P) {
  if (p.period_start && p.period_end && p.period_start !== p.period_end) return `${longDate(p.period_start)} – ${longDate(p.period_end)}`;
  return longDate(p.period_end ?? p.published_at);
}

export default function PostMeta({ post }: { post: P }) {
  return <div className="kicker">{post.kind === 'weekly' ? 'Business Weekly' : 'Daily summary'} · {periodLabel(post)}</div>;
}
