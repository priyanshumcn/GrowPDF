import { findBookById } from '@/lib/db';
import { readFileBytes } from '@/lib/storage';
import { getUserFromRequest } from '@/lib/auth-server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  const { bookId } = await params;
  const book = await findBookById(bookId);
  if (!book) return new Response('Not found', { status: 404 });

  const user = await getUserFromRequest();
  const owns = user && user.library && user.library.some(l => l.bookId === bookId);
  const isAdmin = user && user.role === 'admin';
  if (!owns && !isAdmin) {
    return new Response(JSON.stringify({ error: 'You must purchase this book to read it' }), {
      status: 403,
      headers: { 'content-type': 'application/json' }
    });
  }

  if (!book.pdf) return new Response('No PDF available', { status: 404 });

  try {
    const bytes = await readFileBytes('pdf', book.pdf);
    return new Response(bytes, {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'inline',
        'cache-control': 'private, no-store'
      }
    });
  } catch {
    return new Response('File missing', { status: 404 });
  }
}
