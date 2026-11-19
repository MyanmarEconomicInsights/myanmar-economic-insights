import { timingSafeEqual } from 'node:crypto';

/** Checks "Authorization: Bearer <POST_SECRET>" in constant time. */
export function isAuthorized(req: Request): boolean {
  const secret = process.env.POST_SECRET;
  if (!secret || secret.length < 24) return false; // refuse to run with a missing/weak secret
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
