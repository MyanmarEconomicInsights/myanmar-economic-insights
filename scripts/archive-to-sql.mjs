// Turns content/archive.json into supabase/archive.sql (run: node scripts/archive-to-sql.mjs).
// Paste archive.sql into the Supabase SQL Editor after schema.sql to load the past issues.
import { readFileSync, writeFileSync } from 'node:fs';
const { posts, indicators } = JSON.parse(readFileSync(new URL('../content/archive.json', import.meta.url), 'utf8'));
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
let sql = '-- Past Business Weekly issues (generated from content/archive.json). Safe to re-run.\n\n';
for (const p of posts) {
  sql += `insert into public.monitor_posts (slug, kind, title, dek, body_md, sections, sources, period_start, period_end, published_at) values (${[
    q(p.slug), q(p.kind), q(p.title), q(p.dek), q(p.body_md), `${q(JSON.stringify(p.sections))}::jsonb`,
    `${q(JSON.stringify(p.sources))}::jsonb`, q(p.period_start), q(p.period_end), q(p.published_at)].join(', ')})\n`
    + `on conflict (slug) do update set title = excluded.title, dek = excluded.dek, body_md = excluded.body_md, sections = excluded.sections, sources = excluded.sources;\n\n`;
}
sql += 'insert into public.monitor_indicators (key, category, label, value, unit, location, observed_on, source, note) values\n';
sql += indicators.map((i) => `  (${[q(i.key), q(i.category), q(i.label), i.value, q(i.unit), q(i.location), q(i.observed_on), q(i.source), q(i.note)].join(', ')})`).join(',\n');
sql += '\non conflict (key, location, observed_on) do update set value = excluded.value, label = excluded.label, source = excluded.source, note = excluded.note;\n';
writeFileSync(new URL('../supabase/archive.sql', import.meta.url), sql);
console.log(`wrote supabase/archive.sql: ${posts.length} posts, ${indicators.length} indicators`);
