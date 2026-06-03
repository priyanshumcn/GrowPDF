import { findBookById } from '@/lib/db';
import { publicFileUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  const { bookId } = await params;
  const book = await findBookById(bookId);
  if (!book) return json({ error: 'Book not found' }, 404);
  return json({
    book: {
      ...book,
      thumbnail: publicFileUrl('thumbnail', book.thumbnail)
    }
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}
