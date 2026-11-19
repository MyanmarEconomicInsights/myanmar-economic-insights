import { CATEGORIES } from '@/lib/categories';
import type { CategoryKey } from '@/lib/types';

/** Swatch + category name. Identity is carried by the text; the swatch only reinforces it. */
export default function CategoryTag({ k, short = false }: { k: CategoryKey; short?: boolean }) {
  return (
    <span className="cat">
      <span className="sw" style={{ background: `var(--cat-${k})` }} aria-hidden />
      {short ? CATEGORIES[k].short : CATEGORIES[k].name}
    </span>
  );
}
