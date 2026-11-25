import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from '@/components/Markdown';
import PostMeta from '@/components/PostMeta';
import SectionBlock from '@/components/SectionBlock';
import CategoryTag from '@/components/CategoryTag';
import { getPost } from '@/lib/data';
import { getT } from '@/lib/i18n';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.dek ?? undefined } : {};
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const t = await getT();
  const untranslated = t.lang === 'my' && !(post as { translated?: boolean }).translated;
  return (
    <article className="panel lead" style={{ maxWidth: 780, margin: '0 auto' }}>
      {untranslated && <p className="pill pill-nd" lang="my">{t.english_only}</p>}
      <PostMeta post={post} />
      <h1>{post.title}</h1>
      {post.dek && <p className="dek">{post.dek}</p>}
      {post.sections.some((s) => s.value) && (
        <div className="tiles tiles-5" style={{ margin: '14px 0 6px' }}>
          {post.sections.filter((s) => s.value).map((s) => (
            <a key={s.category} href={`#${s.category}`} className="tile tile-cat" style={{ borderTopColor: `var(--cat-${s.category})`, textDecoration: 'none' }}>
              <CategoryTag k={s.category} short />
              <div className="tile-val">{s.value}</div>
              <div className="tile-delta">{s.label}</div>
            </a>
          ))}
        </div>
      )}
      {post.body_md && <Markdown>{post.body_md}</Markdown>}
      {post.sections.map((s) => <div key={s.category} id={s.category}><SectionBlock s={s} /></div>)}
      {post.sources.length > 0 && (
        <>
          <p className="section-title" style={{ marginTop: 24 }}>{t.sources}</p>
          <ul className="sources">
            {post.sources.map((s, i) => (
              <li key={i}>
                {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a> : s.name}
                {s.date && <span>, {s.date}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="post-foot">
        {t.spotted} <Link href={`/feedback?type=error&post=${post.slug}`}>{t.report_it}</Link>
        {post.kind === 'daily' && post.period_end && <> · <Link href={`/day/${post.period_end}`}>{t.everything_day}</Link></>}
      </p>
    </article>
  );
}
