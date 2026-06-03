import { approveBook } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_req, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const book = await approveBook(id);
    if (!book) return json({ error: 'Book not found' }, 404);
    return json({ book });
  } catch (e) {
    if (e.status) return json({ error: e.message }, e.status);
    return json({ error: 'Approval failed' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
