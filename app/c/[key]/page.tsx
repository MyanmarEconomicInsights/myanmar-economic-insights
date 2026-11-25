import Link from 'next/link';
import { notFound } from 'next/navigation';
import CategoryTag from '@/components/CategoryTag';
import IndicatorTable from '@/components/IndicatorTable';
import KyatPanel from '@/components/KyatPanel';
import Markdown from '@/components/Markdown';
import SourceLink from '@/components/SourceLink';
import StatusBoard from '@/components/StatusBoard';
import { periodLabel } from '@/components/PostMeta';
import { CATEGORIES, CATEGORY_ORDER, isCategory } from '@/lib/categories';
import { getLatestIndicators, getSectionEntries, getStatus } from '@/lib/data';
import { CAT_MY, getT } from '@/lib/i18n';

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
  const t = await getT();
  const c = t.lang === 'my' ? CAT_MY[key] : CATEGORIES[key];
  const board = key === 'trade' ? 'trade' : key === 'conflict' ? 'hotspot' : null;
  const [entries, figures, status] = await Promise.all([getSectionEntries(200), getLatestIndicators(key), board ? getStatus(board) : Promise.resolve([])]);
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

      {status.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <StatusBoard id="board" title={key === 'trade' ? t.board_trade : t.board_hotspot} items={status} />
        </div>
      )}

      <section className="panel" style={{ marginBottom: 24 }}>
        <p className="section-title">{t.latest_figures}</p>
        <IndicatorTable rows={figures} />
        <Link className="more" href={`/data?cat=${key}`}>{t.search_cat(c.short)}</Link>
      </section>

      <div className={key === 'money' ? 'grid' : ''}>
        <div>
          <p className="section-title">{t.updates}</p>
          <div className="panel">
            <ul className="list timeline">
              {mine.map((e) => (
                <li key={e.post.slug}>
                  <div className="kicker">{e.post.kind === 'weekly' ? t.business_weekly : t.daily} · {periodLabel(e.post)}</div>
                  {(e.value || e.label) && <div className="sec-num"><b>{e.value}</b> <span>{e.label}</span></div>}
                  <Markdown>{e.text_md}</Markdown>
                  <div className="src">{e.source && <><SourceLink name={e.source} url={e.source_url} /> · </>}<Link href={`/p/${e.post.slug}`}>{t.full_summary}</Link></div>
                </li>
              ))}
              {!mine.length && <li className="kicker">{t.no_updates}</li>}
            </ul>
          </div>
        </div>
        {key === 'money' && <aside><p className="section-title">{t.kyat}</p><KyatPanel /></aside>}
      </div>
    </>
  );
}
