import { getUserFromRequest } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return new Response(JSON.stringify({ user: null }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}
