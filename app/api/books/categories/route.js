import { getBooks } from '@/lib/db';
import { publicFileUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const books = (await getBooks()).map(b => ({
    ...b,
    thumbnail: publicFileUrl('thumbnail', b.thumbnail)
  }));
  const categories = [...new Set(books.map(b => b.category).filter(Boolean))].sort();
  return new Response(JSON.stringify({ categories }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}
