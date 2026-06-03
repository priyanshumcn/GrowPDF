import { findBookById } from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const user = await requireAuth();
    const { bookId, type } = await req.json();
    const book = await findBookById(bookId);
    if (!book) return json({ error: 'Book not found' }, 404);

    const price = type === 'rent' ? (book.rentPrice || 0) : (book.price || 0);
    if (price <= 0) return json({ error: 'Invalid price' }, 400);

    const intentId = 'pi_' + crypto.randomBytes(12).toString('hex');
    return json({
      intentId,
      amount: price,
      currency: 'usd',
      bookTitle: book.title,
      bookId: book.id,
      type: type === 'rent' ? 'rent' : 'buy'
    });
  } catch (e) {
    if (e.status) return json({ error: e.message }, e.status);
    return json({ error: 'Failed to create payment' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
