import type { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories';
import { isDemo } from '@/lib/data';
import { CAT_MY, getT, lp } from '@/lib/i18n';
import { LangLinks, LangSwitch } from '@/components/LangLinks';
import { SITE_ALT_NAME, SITE_NAME, SITE_SHORT, SITE_TAGLINE } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} (${SITE_SHORT})`, template: `%s · ${SITE_SHORT}` },
  applicationName: SITE_NAME,
  keywords: [SITE_NAME, SITE_SHORT, SITE_ALT_NAME, 'Myanmar economy', 'Burma economy', 'kyat'],
  description: SITE_TAGLINE,
};

const MY_CSS = `
:lang(my) body, body:lang(my) { font-family: 'Noto Sans Myanmar', 'Myanmar Text', 'Pyidaungsu', system-ui, sans-serif; }
:lang(my) .prose, :lang(my) .dek, :lang(my) .list, :lang(my) .area, :lang(my) .board, :lang(my) footer { line-height: 1.85; }
.langsw { font-size: 13px; white-space: nowrap; margin-left: 12px; }
.langsw small { font-size: 10px; opacity: .75; }
.beta-banner { background: #fff6df; border-bottom: 1px solid #ecd9a5; font-size: 13px; padding: 6px 0; }
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  const my = t.lang === 'my';
  const L = (p: string) => lp(t.lang, p);
  return (
    <html lang={t.lang}>
      <head>
        {my && <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;600;700&display=swap" />
        </>}
        <style dangerouslySetInnerHTML={{ __html: MY_CSS }} />
      </head>
      <body>
        <LangLinks lang={t.lang} />
        {my && <div className="beta-banner"><div className="wrap">{t.beta_banner}</div></div>}
        {isDemo && (
          <div className="demo-banner"><div className="wrap">
            Preview: showing the archive of published Business Weekly issues. Live daily posts appear once the database is connected.
          </div></div>
        )}
        <header className="masthead">
          <div className="wrap">
            <Link href={L('/')} className="brand"><b>Burma/{SITE_NAME} <em className="short">{SITE_SHORT}</em></b><span>{my ? t.tagline : SITE_TAGLINE}</span></Link>
            <nav>
              <Link href={L('/daily')}>{t.nav_daily}</Link>
              <Link href={L('/weekly')}>{t.nav_weekly}</Link>
              <Link href={L('/focus')}>{t.nav_focus}</Link>
              <Link href={L('/data')}>{t.nav_data}</Link>
              <Link href={L('/about')}>{t.nav_about}</Link>
              <LangSwitch lang={t.lang} />
            </nav>
          </div>
          <div className="wrap catbar">
            {CATEGORY_ORDER.map((k) => (
              <Link key={k} href={L(`/c/${k}`)}>
                <span className="sw" style={{ background: `var(--cat-${k})` }} aria-hidden />{my ? CAT_MY[k].name : CATEGORIES[k].name}
              </Link>
            ))}
          </div>
        </header>
        <main><div className="wrap">{children}</div></main>
        <footer><div className="wrap">
          <p style={{ margin: '0 0 6px' }}>{t.footer_main} {t.footer_beta}</p>
          <p style={{ margin: '0 0 6px' }}><Link href={L('/feedback')}>{t.feedback_link}</Link></p>
          © {new Date().getFullYear()} {SITE_NAME} ({SITE_ALT_NAME}).
        </div></footer>
        {/* Vercel Web Analytics (cookie-free visitor counts; enabled in the Vercel project) */}
        <script defer src="/_vercel/insights/script.js" />
      </body>
    </html>
  );
}
