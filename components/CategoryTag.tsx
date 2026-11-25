import { CATEGORIES } from '@/lib/categories';
import { CAT_MY, getLang } from '@/lib/i18n';
import type { CategoryKey } from '@/lib/types';

/** Swatch + category name. Identity is carried by the text; the swatch only reinforces it. */
export default async function CategoryTag({ k, short = false }: { k: CategoryKey; short?: boolean }) {
  const c = (await getLang()) === 'my' ? CAT_MY[k] : CATEGORIES[k];
  return (
    <span className="cat">
      <span className="sw" style={{ background: `var(--cat-${k})` }} aria-hidden />
      {short ? c.short : c.name}
    </span>
  );
}
