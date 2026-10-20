import { redirect } from 'next/navigation';
import { sanitizeRedirect } from '@/lib/redirect';

/**
 * Server Component Compatibility Redirect.
 * Immediately issues an HTTP 307 server redirect from /admin/login to /login.
 * Preserves safe admin redirect destination while preventing redirect loops.
 */
export default async function AdminLoginPage({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const rawRedirect = resolvedParams.redirect || '/admin';

  const safeTarget = sanitizeRedirect(rawRedirect, { fallback: '/admin', role: 'ADMIN' });
  const target = safeTarget === '/' ? '/admin' : safeTarget;

  redirect(`/login?redirect=${encodeURIComponent(target)}`);
}
