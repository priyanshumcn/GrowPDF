import { readFileBytes } from '@/lib/storage';
import { getBooks } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  const { filename } = await params;
  const safe = path.basename(filename);

  const user = await getUserFromRequest();
  if (!user) return new Response(JSON.stringify({ error: 'Sign in required' }), {
    status: 401, headers: { 'content-type': 'application/json' }
  });

  const all = await getBooks();
  const book = all.find(b => b.pdf === safe);
  if (!book) return new Response('Not found', { status: 404 });

  const owns = user.library && user.library.some(l => l.bookId === book.id);
  const isAdmin = user.role === 'admin';
  if (!owns && !isAdmin) {
    return new Response(JSON.stringify({ error: 'Purchase required' }), {
      status: 403, headers: { 'content-type': 'application/json' }
    });
  }

  try {
    const bytes = await readFileBytes('pdf', safe);
    return new Response(bytes, {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'inline',
        'cache-control': 'private, no-store'
      }
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
