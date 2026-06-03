import { findBookById, findCouponByCode } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { code, bookId, type } = await req.json();
    if (!code) return json({ error: 'Coupon code is required' }, 400);
    const book = await findBookById(bookId);
    if (!book) return json({ error: 'Book not found' }, 404);

    const base = type === 'rent' ? (book.rentPrice || 0) : (book.price || 0);
    if (base <= 0) return json({ error: 'Invalid price' }, 400);

    const coupon = await findCouponByCode(code);
    if (!coupon) return json({ error: 'Invalid or expired coupon code' }, 400);
    if (coupon.usesLeft !== undefined && coupon.usesLeft <= 0) {
      return json({ error: 'This coupon has been fully redeemed' }, 400);
    }

    let discount = 0;
    if (coupon.type === 'percent') {
      discount = +(base * (coupon.discount / 100)).toFixed(2);
    } else {
      discount = Math.min(coupon.discount, base);
    }
    const final = Math.max(0, +(base - discount).toFixed(2));
    return json({
      valid: true,
      code: coupon.code,
      discount,
      finalPrice: final,
      originalPrice: base
    });
  } catch (e) {
    return json({ error: 'Failed to validate coupon' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
