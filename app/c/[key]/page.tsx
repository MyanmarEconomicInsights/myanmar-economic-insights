import Link from 'next/link';
import { notFound } from 'next/navigation';
import CategoryTag from '@/components/CategoryTag';
import IndicatorTable from '@/components/IndicatorTable';
import KyatPanel from '@/components/KyatPanel';
import Markdown from '@/components/Markdown';
import { periodLabel } from '@/components/PostMeta';
import { CATEGORIES, CATEGORY_ORDER, isCategory } from '@/lib/categories';
import { getLatestIndicators, getSectionEntries } from '@/lib/data';

export const revalidate = 300;
export const dynamicParams = false;

type Props = { params: Promise<{ key: string }> };

export function generateStaticParams() {
  return CATEGORY_ORDER.map((key) => ({ key }));
}

export async function generateMetadata({ params }: Props) {
  const { key } = await params;
  return isCategory(key) ? { title: CATEGORIES[key].name, description: CATEGORIES[key].about } : {};
}

export default async function CategoryPage({ params }: Props) {
  const { key } = await params;
  if (!isCategory(key)) notFound();
  const c = CATEGORIES[key];
  const [entries, figures] = await Promise.all([getSectionEntries(200), getLatestIndicators(key)]);
  const mine = entries.filter((e) => e.category === key);

  return (
    <>
      <nav className="catnav" aria-label="Categories">
        {CATEGORY_ORDER.map((k) => (
          <Link key={k} href={`/c/${k}`} aria-current={k === key ? 'page' : undefined}><CategoryTag k={k} short /></Link>
        ))}
      </nav>
      <header className="cat-hero" style={{ borderTopColor: `var(--cat-${key})` }}>
        <h1>{c.name}</h1>
        <p className="dek">{c.about}</p>
        <ul className="tracks">{c.tracks.map((t) => <li key={t}>{t}</li>)}</ul>
      </header>

      <section className="panel" style={{ marginBottom: 24 }}>
        <p className="section-title">Latest tracked figures</p>
        <IndicatorTable rows={figures} />
        <Link className="more" href={`/data?cat=${key}`}>Search, sort and download all {c.short.toLowerCase()} data →</Link>
      </section>

      <div className={key === 'money' ? 'grid' : ''}>
        <div>
          <p className="section-title">Updates</p>
          <div className="panel">
            <ul className="list timeline">
              {mine.map((e) => (
                <li key={e.post.slug}>
                  <div className="kicker">{e.post.kind === 'weekly' ? 'Business Weekly' : 'Daily'} · {periodLabel(e.post)}</div>
                  {(e.value || e.label) && <div className="sec-num"><b>{e.value}</b> <span>{e.label}</span></div>}
                  <Markdown>{e.text_md}</Markdown>
                  <div className="src">{e.source && <>{e.source} · </>}<Link href={`/p/${e.post.slug}`}>Full summary →</Link></div>
                </li>
              ))}
              {!mine.length && <li className="kicker">No updates in this category yet.</li>}
            </ul>
          </div>
        </div>
        {key === 'money' && <aside><p className="section-title">Kyat</p><KyatPanel /></aside>}
      </div>
    </>
  );
}
