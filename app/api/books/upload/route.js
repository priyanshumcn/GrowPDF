import { addPendingBook, findUserById } from '@/lib/db';
import { saveFile, publicFileUrl } from '@/lib/storage';
import { getUserFromRequest } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_PDF = 50 * 1024 * 1024;
const MAX_IMG = 5 * 1024 * 1024;

export async function POST(req) {
  const user = await getUserFromRequest();
  if (!user) return jsonErr('Sign in to upload books', 401);
  if (user.role !== 'publisher' && user.role !== 'admin') {
    return jsonErr('Only publishers can upload books', 403);
  }

  let form;
  try {
    form = await req.formData();
  } catch {
    return jsonErr('Invalid form data', 400);
  }

  const title = (form.get('title') || '').toString().trim();
  const author = (form.get('author') || '').toString().trim();
  const description = (form.get('description') || '').toString().trim();
  const category = (form.get('category') || '').toString().trim();
  const price = parseFloat(form.get('price') || '0');
  const rentPrice = parseFloat(form.get('rentPrice') || '0');
  const rentDays = parseInt(form.get('rentDays') || '14', 10);
  const isbn = (form.get('isbn') || '').toString().trim();
  const pages = parseInt(form.get('pages') || '0', 10) || null;
  const language = (form.get('language') || 'English').toString().trim();
  const pdf = form.get('pdf');
  const thumbnail = form.get('thumbnail');

  if (!title || !author) return jsonErr('Title and author are required', 400);
  if (!pdf || typeof pdf === 'string') return jsonErr('A PDF file is required', 400);
  if (pdf.size > MAX_PDF) return jsonErr('PDF must be under 50 MB', 413);
  if (pdf.type && pdf.type !== 'application/pdf') return jsonErr('File must be a PDF', 400);
  if (thumbnail && typeof thumbnail !== 'string' && thumbnail.size > MAX_IMG) {
    return jsonErr('Thumbnail must be under 5 MB', 413);
  }

  let pdfName = null, thumbName = null;
  try {
    pdfName = await saveFile(pdf, 'pdf');
    if (thumbnail && typeof thumbnail !== 'string' && thumbnail.size > 0) {
      thumbName = await saveFile(thumbnail, 'image');
    }
  } catch (e) {
    return jsonErr('Failed to save files', 500);
  }

  const book = await addPendingBook({
    title, author, description, category,
    price: isNaN(price) ? 0 : price,
    rentPrice: isNaN(rentPrice) ? 0 : rentPrice,
    rentDays: isNaN(rentDays) ? 14 : rentDays,
    isbn, pages, language,
    pdf: pdfName,
    thumbnail: thumbName,
    publisherId: user.id,
    publisherName: user.name
  });

  return json({ book: { ...book, thumbnail: publicFileUrl('thumbnail', book.thumbnail) } }, 201);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}
function jsonErr(msg, status) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}
