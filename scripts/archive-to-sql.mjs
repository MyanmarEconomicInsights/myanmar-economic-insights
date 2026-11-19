// Turns content/archive.json into supabase/archive.sql (run: node scripts/archive-to-sql.mjs).
// Paste archive.sql into the Supabase SQL Editor after schema.sql to load the past issues.
import { readFileSync, writeFileSync } from 'node:fs';
const { posts, indicators, status = [] } = JSON.parse(readFileSync(new URL('../content/archive.json', import.meta.url), 'utf8'));
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
if (status.length) {
  sql += '\ninsert into public.monitor_status (board, name, place, status, level, note, source, as_of, sort) values\n';
  sql += status.map((s) => `  (${[q(s.board), q(s.name), q(s.place), q(s.status), q(s.level), q(s.note), q(s.source), q(s.as_of), s.sort ?? 99].join(', ')})`).join(',\n');
  sql += '\non conflict (board, name) do update set place = excluded.place, status = excluded.status, level = excluded.level, note = excluded.note, source = excluded.source, as_of = excluded.as_of, sort = excluded.sort;\n';
}
writeFileSync(new URL('../supabase/archive.sql', import.meta.url), sql);
console.log(`wrote supabase/archive.sql: ${posts.length} posts, ${indicators.length} indicators`);
