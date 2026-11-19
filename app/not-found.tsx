import Link from 'next/link';
export default function NotFound() {
  return <div className="panel"><h1 style={{ marginTop: 0 }}>Page not found</h1><Link href="/">Back to the homepage</Link></div>;
}
