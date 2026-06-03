import { findBookById } from '@/lib/db';
import { publicFileUrl } from '@/lib/storage';
import { requireAuth } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await requireAuth();
    const library = user.library || [];
    const items = [];
    for (const entry of library) {
      const b = await findBookById(entry.bookId);
      if (b) {
        items.push({
          ...entry,
          book: {
            ...b,
            thumbnail: publicFileUrl('thumbnail', b.thumbnail)
          }
        });
      }
    }
    return json({ library: items });
  } catch (e) {
    if (e.status) return new Response(JSON.stringify({ error: e.message }), { status: e.status, headers: { 'content-type': 'application/json' } });
    return json({ error: 'Failed to load library' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
