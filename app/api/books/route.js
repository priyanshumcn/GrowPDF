import { getBooks } from '@/lib/db';
import { publicFileUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = (searchParams.get('search') || '').toLowerCase();
  const sort = searchParams.get('sort') || 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

  let books = await getBooks();
  books = books.map(format);

  if (category && category !== 'all') {
    books = books.filter(b => (b.category || '').toLowerCase() === category.toLowerCase());
  }
  if (search) {
    books = books.filter(b =>
      (b.title || '').toLowerCase().includes(search) ||
      (b.author || '').toLowerCase().includes(search) ||
      (b.description || '').toLowerCase().includes(search)
    );
  }

  switch (sort) {
    case 'price-asc': books.sort((a, b) => a.price - b.price); break;
    case 'price-desc': books.sort((a, b) => b.price - a.price); break;
    case 'bestselling': books.sort((a, b) => (b.sales || 0) - (a.sales || 0)); break;
    case 'rating': books.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    default: books.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  const total = books.length;
  const start = (page - 1) * limit;
  const items = books.slice(start, start + limit);

  return new Response(JSON.stringify({ books: items, total, page, limit }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}

function format(b) {
  return {
    ...b,
    thumbnail: publicFileUrl('thumbnail', b.thumbnail),
    pdf: undefined
  };
}
