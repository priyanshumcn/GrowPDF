import { getPendingBooks } from '@/lib/db';
import { publicFileUrl } from '@/lib/storage';
import { requireAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    const pending = (await getPendingBooks()).map(b => ({
      ...b,
      thumbnail: publicFileUrl('thumbnail', b.thumbnail)
    }));
    return json({ books: pending });
  } catch (e) {
    if (e.status) return json({ error: e.message }, e.status);
    return json({ error: 'Failed to load' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
