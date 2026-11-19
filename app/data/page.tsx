import DataExplorer from '@/components/DataExplorer';
import { getAllIndicators, getSectionEntries } from '@/lib/data';

export const revalidate = 300;
export const metadata = { title: 'Data', description: 'Search, filter, sort and download every figure and update we track.' };

export default async function DataPage() {
  const [figures, entries] = await Promise.all([getAllIndicators(), getSectionEntries(500)]);
  const updates = entries.map((e) => ({
    category: e.category, value: e.value ?? '', label: e.label ?? '', text: e.text_md, source: e.source ?? '',
    date: (e.post.period_end ?? e.post.published_at).slice(0, 10), kind: e.post.kind, slug: e.post.slug,
  }));
  return (
    <>
      <h1 style={{ margin: '0 0 4px' }}>Data</h1>
      <p className="dek">
        Every figure and update we publish, refreshed daily. Search, filter and sort below, or download the data.
      </p>
      <DataExplorer figures={figures} updates={updates} />
    </>
  );
}
