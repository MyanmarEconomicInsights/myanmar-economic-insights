import FeedbackForm from '@/components/FeedbackForm';

export const metadata = { title: 'Suggest or correct', description: 'Suggest a topic or report an error.' };

type Props = { searchParams: Promise<{ type?: string; post?: string }> };

export default async function Feedback({ searchParams }: Props) {
  const sp = await searchParams;
  const kind = ['topic', 'error', 'other'].includes(sp.type ?? '') ? sp.type : 'topic';
  const post = /^[a-z0-9-]{1,80}$/.test(sp.post ?? '') ? sp.post : '';
  return (
    <div className="panel" style={{ maxWidth: 780, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Suggest or correct</h1>
      <p className="dek">Tell us what we should track, or point out a figure or claim that is wrong. Corrections with a source are especially welcome.</p>
      <FeedbackForm kind={kind} post={post} />
    </div>
  );
}
