import type { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories';
import { isDemo } from '@/lib/data';
import { SITE_ALT_NAME, SITE_NAME, SITE_SHORT, SITE_TAGLINE } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} (${SITE_SHORT})`, template: `%s · ${SITE_SHORT}` },
  applicationName: SITE_NAME,
  keywords: [SITE_NAME, SITE_SHORT, SITE_ALT_NAME, 'Myanmar economy', 'Burma economy', 'kyat'],
  description: SITE_TAGLINE,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {isDemo && (
          <div className="demo-banner"><div className="wrap">
            Preview: showing the archive of published Business Weekly issues. Live daily posts appear once the database is connected.
          </div></div>
        )}
        <header className="masthead">
          <div className="wrap">
            <Link href="/" className="brand"><b>{SITE_NAME} <em className="short">{SITE_SHORT}</em></b><span>{SITE_TAGLINE}</span></Link>
            <nav>
              <Link href="/daily">Daily</Link>
              <Link href="/weekly">Business Weekly</Link>
              <Link href="/data">Data</Link>
              <Link href="/about">About</Link>
            </nav>
          </div>
          <div className="wrap catbar">
            {CATEGORY_ORDER.map((k) => (
              <Link key={k} href={`/c/${k}`}>
                <span className="sw" style={{ background: `var(--cat-${k})` }} aria-hidden />{CATEGORIES[k].name}
              </Link>
            ))}
          </div>
        </header>
        <main><div className="wrap">{children}</div></main>
        <footer><div className="wrap">
          <p style={{ margin: '0 0 6px' }}>
            {SITE_SHORT} is an AI-powered pilot project. Summaries are compiled with AI, with about 20–30% human review and editing. A Burmese (Myanmar-language) version is coming soon.
            Every figure is published with a named source and date; please check the original source before relying on it.
          </p>
          © {new Date().getFullYear()} {SITE_NAME} ({SITE_ALT_NAME}).
        </div></footer>
        {/* Vercel Web Analytics (cookie-free visitor counts; enabled in the Vercel project) */}
        <script defer src="/_vercel/insights/script.js" />
      </body>
    </html>
  );
}
