export type CategoryKey = 'prices' | 'trade' | 'business' | 'money' | 'conflict';

/** One category's part of a post: its headline number plus a short write-up. */
export interface Section {
  category: CategoryKey;
  value?: string;     // headline number, e.g. "K4,760"
  label?: string;     // what the number means, one line
  text_md: string;    // 2–3 sentences or bullets (Markdown)
  source?: string;    // named source + date for the number
}

export interface SourceRef { name: string; url?: string; date?: string }

export interface Post {
  slug: string;
  kind: 'daily' | 'weekly';
  title: string;
  dek: string | null;
  body_md: string;     // optional intro / overview
  sections: Section[];
  sources: SourceRef[];
  period_start: string | null;
  period_end: string | null;
  published_at: string;
}

export interface Indicator {
  key: string;
  category: CategoryKey | null;
  label: string;
  value: number;
  unit: string | null;
  location: string;
  observed_on: string;
  source: string;
  source_url?: string | null;
  note?: string | null;
}
