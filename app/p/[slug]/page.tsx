import { notFound } from 'next/navigation';
import Markdown from '@/components/Markdown';
import PostMeta from '@/components/PostMeta';
import SectionBlock from '@/components/SectionBlock';
import { getPost } from '@/lib/data';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.dek ?? undefined } : {};
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return (
    <article className="panel lead" style={{ maxWidth: 780, margin: '0 auto' }}>
      <PostMeta post={post} />
      <h1>{post.title}</h1>
      {post.dek && <p className="dek">{post.dek}</p>}
      {post.body_md && <Markdown>{post.body_md}</Markdown>}
      {post.sections.map((s) => <SectionBlock key={s.category} s={s} />)}
      {post.sources.length > 0 && (
        <>
          <p className="section-title" style={{ marginTop: 24 }}>Sources</p>
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
    </article>
  );
}
