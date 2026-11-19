import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories';
import { SITE_ALT_NAME, SITE_NAME, SITE_SHORT } from '@/lib/site';

export const metadata = { title: 'About' };

export default function About() {
  return (
    <div className="panel prose" style={{ maxWidth: 780, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>About</h1>
      <p>{SITE_NAME} ({SITE_SHORT}), also published as {SITE_ALT_NAME}, tracks Myanmar&rsquo;s economy as people and businesses experience it. A short summary is posted each day, and the Business Weekly comes out every Friday.</p>
      <p>Coverage is organised into five categories:</p>
      <ul>{CATEGORY_ORDER.map((k) => <li key={k}><strong>{CATEGORIES[k].name}.</strong> {CATEGORIES[k].about}</li>)}</ul>
      <p>Each daily summary and weekly issue gives one headline number for each area, with a short note on why it moved.</p>
      <p>Every figure is published with a named source and date. When a figure can&rsquo;t be sourced, it is left out rather than estimated.</p>
    </div>
  );
}
