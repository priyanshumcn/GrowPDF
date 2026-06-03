import { rejectBook } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = (body.reason || '').toString().slice(0, 500);
    const book = await rejectBook(id, reason);
    if (!book) return json({ error: 'Book not found' }, 404);
    return json({ book });
  } catch (e) {
    if (e.status) return json({ error: e.message }, e.status);
    return json({ error: 'Rejection failed' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
