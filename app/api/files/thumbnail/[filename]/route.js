import { readFileBytes } from '@/lib/storage';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp',
  '.gif': 'image/gif'
};

export async function GET(_req, { params }) {
  const { filename } = await params;
  const safe = path.basename(filename);
  try {
    const bytes = await readFileBytes('thumbnail', safe);
    const ext = path.extname(safe).toLowerCase();
    return new Response(bytes, {
      status: 200,
      headers: {
        'content-type': MIME[ext] || 'image/jpeg',
        'cache-control': 'public, max-age=3600'
      }
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
