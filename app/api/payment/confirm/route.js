import { findBookById, findCouponByCode, recordPayment, incrementBookSales, addToUserLibrary } from '@/lib/db';
import { requireAuth } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const user = await requireAuth();
    const { bookId, type, couponCode, intentId } = await req.json();
    const book = await findBookById(bookId);
    if (!book) return json({ error: 'Book not found' }, 404);

    const base = type === 'rent' ? (book.rentPrice || 0) : (book.price || 0);
    if (base <= 0) return json({ error: 'Invalid price' }, 400);

    let finalAmount = base;
    let discount = 0;
    if (couponCode) {
      const coupon = await findCouponByCode(couponCode);
      if (coupon) {
        if (coupon.type === 'percent') {
          discount = +(base * (coupon.discount / 100)).toFixed(2);
        } else {
          discount = Math.min(coupon.discount, base);
        }
        finalAmount = Math.max(0, +(base - discount).toFixed(2));
      }
    }

    await recordPayment({
      userId: user.id,
      bookId: book.id,
      type: type === 'rent' ? 'rent' : 'buy',
      amount: finalAmount,
      originalAmount: base,
      discount,
      couponCode: couponCode || null,
      intentId: intentId || null
    });

    await incrementBookSales(book.id, 1);

    const now = new Date();
    let expiresAt = null;
    if (type === 'rent') {
      const days = book.rentDays || 14;
      expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    await addToUserLibrary(user.id, {
      bookId: book.id,
      type: type === 'rent' ? 'rent' : 'buy',
      purchasedAt: now.toISOString(),
      expiresAt
    });

    return json({
      ok: true,
      bookId: book.id,
      type: type === 'rent' ? 'rent' : 'buy',
      amount: finalAmount,
      redirect: `/library`
    });
  } catch (e) {
    if (e.status) return json({ error: e.message }, e.status);
    return json({ error: 'Payment failed' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
