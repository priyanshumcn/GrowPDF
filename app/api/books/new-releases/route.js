import { getBooks, getPendingBooks } from '@/lib/db';
import { publicFileUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  // Include both approved books AND pending books (non-rejected) so newly
  // uploaded books appear on the landing page right after upload.
  const [approved, pending] = await Promise.all([getBooks(), getPendingBooks()]);

  const allBooks = [
    ...approved,
    ...pending.filter(b => b.status !== 'rejected'),
  ];

  const books = allBooks
    .slice()
    .sort((a, b) => {
      const tA = new Date(a.createdAt || a.submittedAt || a.approvedAt || 0).getTime();
      const tB = new Date(b.createdAt || b.submittedAt || b.approvedAt || 0).getTime();
      return tB - tA; // newest first
    })
    .slice(0, 12)
    .map(b => ({ ...b, thumbnail: publicFileUrl('thumbnail', b.thumbnail) }));

  return new Response(JSON.stringify({ books }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}
