'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BookCover } from '@/components/BookCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Tag, CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck } from 'lucide-react';

function CheckoutInner() {
  const { bookId } = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const type = search.get('type') === 'rent' ? 'rent' : 'buy';
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState(null);
  const [couponErr, setCouponErr] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [card, setCard] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/29');
  const [cvc, setCvc] = useState('123');

  useEffect(() => {
    fetch(`/api/books/${bookId}`).then(r => r.json()).then(d => {
      setBook(d.book);
      setLoading(false);
    });
  }, [bookId]);

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }
  if (!book) {
    return <div className="max-w-2xl mx-auto py-24 text-center"><p className="text-text-light">Book not found.</p></div>;
  }

  const base = type === 'rent' ? (book.rentPrice || 0) : (book.price || 0);
  const discount = applied?.discount || 0;
  const final = Math.max(0, base - discount);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponErr('');
    setCouponLoading(true);
    try {
      const res = await fetch('/api/payment/validate-coupon', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: coupon, bookId, type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid coupon');
      setApplied(data);
    } catch (e) {
      setCouponErr(e.message);
      setApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const onPay = async () => {
    setProcessing(true);
    try {
      const intent = await fetch('/api/payment/create-intent', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bookId, type })
      }).then(r => r.json());

      await new Promise(r => setTimeout(r, 1200));

      const confirm = await fetch('/api/payment/confirm', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          bookId, type,
          couponCode: applied?.code,
          intentId: intent.intentId
        })
      }).then(r => r.json());

      if (!confirm.ok) throw new Error(confirm.error || 'Payment failed');
      setDone(true);
      setTimeout(() => router.push('/library'), 2000);
    } catch (e) {
      alert(e.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-text-light hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <AnimatePresence>
        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-success" />
            </motion.div>
            <h2 className="font-serif text-3xl font-bold">Payment successful!</h2>
            <p className="text-text-light mt-2">Taking you to your library…</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-5">
              <h1 className="font-serif text-3xl font-bold">Checkout</h1>

              <div className="bg-cream border border-warm/60 rounded-2xl p-6 shadow-soft">
                <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" /> Have a coupon?
                </h3>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={e => setCoupon(e.target.value.toUpperCase())}
                    placeholder="WELCOME10"
                    className="flex-1 px-4 py-2.5 rounded-lg border border-warm bg-warm/30 focus:bg-cream focus:border-primary outline-none text-sm font-mono"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2.5 rounded-lg bg-text text-cream font-medium text-sm hover:bg-accent transition-colors disabled:opacity-60"
                  >
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {couponErr && <p className="text-xs text-red-600 mt-2">{couponErr}</p>}
                {applied && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    Code <span className="font-mono font-semibold">{applied.code}</span> applied — you saved ${applied.discount.toFixed(2)}!
                  </div>
                )}
              </div>

              <div className="bg-cream border border-warm/60 rounded-2xl p-6 shadow-soft">
                <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Payment details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-text-light mb-1">Card number</label>
                    <input value={card} onChange={e => setCard(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-warm bg-warm/30 focus:bg-cream focus:border-primary outline-none text-sm font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-text-light mb-1">Expiry</label>
                      <input value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-warm bg-warm/30 focus:bg-cream focus:border-primary outline-none text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs text-text-light mb-1">CVC</label>
                      <input value={cvc} onChange={e => setCvc(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-warm bg-warm/30 focus:bg-cream focus:border-primary outline-none text-sm font-mono" />
                    </div>
                  </div>
                  <p className="flex items-center gap-1 text-xs text-text-light pt-1">
                    <ShieldCheck className="w-3 h-3" /> Demo payment — no real charge will be made
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-warm/50 border border-warm rounded-2xl p-6 shadow-soft h-fit sticky top-20">
              <h3 className="font-serif text-lg font-semibold mb-4">Order summary</h3>
              <div className="flex gap-3 mb-4">
                <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0">
                  <BookCover book={book} />
                </div>
                <div className="min-w-0">
                  <p className="font-serif font-semibold text-text line-clamp-2 text-sm">{book.title}</p>
                  <p className="text-xs text-text-light mt-0.5">{book.author}</p>
                  <span className="text-[10px] uppercase tracking-wider text-primary font-semibold mt-1 inline-block">
                    {type === 'rent' ? `Rent · ${book.rentDays || 14} days` : 'Buy · Lifetime'}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm border-t border-warm pt-4">
                <Row label="Subtotal" value={base} />
                {applied && <Row label={`Coupon (${applied.code})`} value={-discount} green />}
                <div className="flex items-center justify-between font-serif text-lg font-bold pt-2 border-t border-warm">
                  <span>Total</span>
                  <span className="text-primary">${final.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={onPay}
                disabled={processing}
                className="w-full mt-5 bg-primary text-cream font-semibold py-3 rounded-lg shadow-medium hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {processing ? 'Processing…' : `Pay $${final.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, green }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-light">{label}</span>
      <span className={green ? 'text-success' : 'text-text'}>
        {green ? '-' : ''}${Math.abs(value).toFixed(2)}
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutInner />
    </ProtectedRoute>
  );
}
