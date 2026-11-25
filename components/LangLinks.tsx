'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const isMy = (p: string) => p === '/my' || p.startsWith('/my/');
const toMy = (h: string) => (h === '/' ? '/my' : `/my${h}`);
const skip = (h: string) => isMy(h) || h.startsWith('/api/') || h.startsWith('/_next/') || h.startsWith('//');

/**
 * Burmese Beta: keeps visitors on /my. On a /my page, every internal link (href="/...") is pointed at its /my version,
 * and clicks on those links stay inside the Burmese site. Links marked data-lang-switch are left alone.
 */
export function LangLinks({ lang }: { lang: 'en' | 'my' }) {
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (lang !== 'my') return;
    const fix = () => document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]:not([data-lang-switch])').forEach((a) => {
      const h = a.getAttribute('href')!;
      if (!skip(h)) a.setAttribute('href', toMy(h));
    });
    fix();
    const mo = new MutationObserver(fix);
    mo.observe(document.body, { subtree: true, childList: true });
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || a.target === '_blank' || a.hasAttribute('data-lang-switch')) return;
      const h = a.getAttribute('href');
      if (!h || !h.startsWith('/') || h.startsWith('/api/') || h.startsWith('/_next/')) return;
      e.preventDefault();
      e.stopPropagation();
      router.push(isMy(h) ? h : toMy(h));
    };
    window.addEventListener('click', onClick, true);
    return () => { mo.disconnect(); window.removeEventListener('click', onClick, true); };
  }, [lang, path, router]);
  return null;
}

/** "English | မြန်မာ" switch: the same page in the other language. */
export function LangSwitch({ lang }: { lang: 'en' | 'my' }) {
  const path = usePathname();
  const [here, setHere] = useState('/');
  useEffect(() => { setHere(window.location.pathname + window.location.search + window.location.hash); }, [path]);
  const en = isMy(here) ? here.slice(3) || '/' : here;
  const my = isMy(here) ? here : toMy(here);
  return (
    <span className="langsw">
      {lang === 'en' ? <b>English</b> : <a data-lang-switch href={en}>English</a>}
      {' | '}
      {lang === 'my' ? <b lang="my">မြန်မာ <small>Beta</small></b> : <a data-lang-switch href={my} lang="my">မြန်မာ <small>Beta</small></a>}
    </span>
  );
}
