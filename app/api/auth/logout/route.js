import { TOKEN_NAME } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'set-cookie': `${TOKEN_NAME}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly=false`
    }
  });
}
