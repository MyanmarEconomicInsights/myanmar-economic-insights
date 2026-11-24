/** A source name that links to the original article when we have its URL (opens in a new tab). */
export default function SourceLink({ name, url }: { name: string; url?: string | null }) {
  if (!url) return <>{name}</>;
  return <a className="ext" href={url} target="_blank" rel="noopener noreferrer">{name}<span aria-hidden> ↗</span></a>;
}
