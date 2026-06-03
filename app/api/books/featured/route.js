import { getBooks } from '@/lib/db';
import { publicFileUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const books = (await getBooks())
    .filter(b => b.featured)
    .map(b => ({ ...b, thumbnail: publicFileUrl('thumbnail', b.thumbnail) }));
  return new Response(JSON.stringify({ books }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}
