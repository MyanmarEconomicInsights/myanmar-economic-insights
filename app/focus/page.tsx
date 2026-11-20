import Link from 'next/link';
import { FOCUS } from '@/lib/focus';

export const metadata = { title: 'In Focus', description: 'Special reports on scam centres, rare earths and critical minerals, and drugs and the illicit economy.' };

export default function Page() {
  return (
    <div className="panel">
      <h1 style={{ marginTop: 0 }}>In Focus</h1>
      <p className="dek">Special reports on the parts of Myanmar&apos;s economy that the conflict has made central: key numbers, the latest research from credible institutions, and our own coverage.</p>
      <ul className="list">
        {FOCUS.map((t) => (
          <li key={t.key}><Link href={`/focus/${t.key}`}>{t.name}</Link><div className="dek" style={{ margin: '4px 0 0' }}>{t.short}</div></li>
        ))}
      </ul>
    </div>
  );
}
