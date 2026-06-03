import { getBooks } from '@/lib/db';
import { publicFileUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const books = (await getBooks())
    .slice()
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 10)
    .map(b => ({ ...b, thumbnail: publicFileUrl('thumbnail', b.thumbnail) }));
  return new Response(JSON.stringify({ books }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}
