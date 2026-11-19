import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Raw HTML in posts is ignored (react-markdown default), so posted text can't inject scripts.
export default function Markdown({ children }: { children: string }) {
  return <div className="prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown></div>;
}
