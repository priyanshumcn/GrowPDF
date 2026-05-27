import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Tag, Shield, CreditCard, Lock, BookOpen, Loader2 } from 'lucide-react';
import axios from 'axios';
import { BookCover } from '../components/BookCard';

const Checkout = () => {
  const { bookId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const accessType = searchParams.get('type') || 'buy';
  const rentalDays = parseInt(searchParams.get('days')) || 7;

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await axios.get(`/api/books/${bookId}`);
        setBook(data);
      } catch {
        // Could not load book
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  const basePrice = () => {
    if (!book) return 0;
    return accessType === 'buy' ? book.price : book.rentalPrice * rentalDays;
  };

  const discount = () => {
    if (!coupon) return 0;
    const base = basePrice();
    if (coupon.type === 'percentage') return base * (coupon.value / 100);
    return Math.min(base, coupon.value);
  };

  const finalPrice = () => Math.max(0, basePrice() - discount()).toFixed(2);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const { data } = await axios.post('/api/payment/validate-coupon', { code: couponCode, bookId });
      if (data.valid) {
        setCoupon(data.coupon);
      } else {
        setCoupon(null);
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch {
      setCouponError('Could not validate coupon. Try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setPaymentError('');
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      // Step 1: Create payment intent
      await axios.post('/api/payment/create-intent', {
        bookId,
        accessType,
        rentalDays,
        couponCode: coupon?.code,
      }, { headers });

      // Step 2: Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Step 3: Confirm payment
      await axios.post('/api/payment/confirm', {
        paymentIntentId: `pi_${Date.now()}`,
        bookId,
        accessType,
        rentalDays,
      }, { headers });

      setPaymentSuccess(true);
    } catch (err) {
      setPaymentError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-cream pt-24 flex items-center justify-center px-6 text-center">
        <div>
          <h2 className="text-xl font-serif font-bold text-primary mb-3">Book not found</h2>
          <Link to="/books" className="text-highlight hover:underline text-sm">Browse books</Link>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-20 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-12 shadow-soft text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.15, stiffness: 200 }}
            className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-green-500" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-2xl font-serif font-bold text-primary mb-3">Payment Successful</h1>
          <p className="text-text-light text-sm mb-8 leading-relaxed">
            {accessType === 'buy' ? 'You now own' : `You've rented`}{' '}
            <span className="font-medium text-primary">"{book.title}"</span>
            {accessType === 'rent' && ` for ${rentalDays} days`}.
          </p>
          <div className="space-y-3">
            <Link
              to={`/reader/${bookId}`}
              className="w-full bg-primary text-white py-3.5 rounded-xl hover:bg-highlight transition-colors font-medium text-sm block text-center"
            >
              Start Reading Now
            </Link>
            <Link
              to="/library"
              className="w-full border border-warm text-text-light py-3.5 rounded-xl hover:border-primary hover:text-primary transition-colors text-sm block text-center"
            >
              Go to My Library
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          to={`/books/${bookId}`}
          className="inline-flex items-center gap-2 text-text-light hover:text-primary transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to book
        </Link>

        <h1 className="text-3xl font-serif font-bold text-primary mb-8">Checkout</h1>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Left — order + coupon */}
          <div className="md:col-span-3 space-y-5">
            {/* Order summary */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h3 className="font-semibold text-primary text-sm mb-4">Order Summary</h3>
              <div className="flex gap-4">
                {/* Book cover */}
                <div className="w-16 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                  <BookCover book={book} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-primary text-sm leading-tight mb-1 line-clamp-2">{book.title}</h4>
                  <p className="text-text-light text-xs mb-2">{book.author}</p>
                  <span className="inline-block text-xs font-medium text-primary bg-warm px-2.5 py-1 rounded-full">
                    {accessType === 'buy' ? 'Purchase · Lifetime access' : `Rental · ${rentalDays} days`}
                  </span>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h3 className="font-semibold text-primary text-sm mb-4">Have a coupon?</h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCoupon(null); setCouponError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && validateCoupon()}
                    className="w-full bg-warm border-2 border-transparent rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors font-mono tracking-wider"
                    placeholder="COUPON CODE"
                    disabled={!!coupon}
                  />
                </div>
                <button
                  onClick={coupon ? () => { setCoupon(null); setCouponCode(''); } : validateCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className={`px-5 py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-40 ${coupon ? 'bg-warm text-text-light hover:bg-red-50 hover:text-red-500' : 'bg-primary text-white hover:bg-highlight'}`}
                >
                  {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : coupon ? 'Remove' : 'Apply'}
                </button>
              </div>
              {coupon && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 text-xs mt-2.5 font-medium"
                >
                  ✓ {coupon.description} — {coupon.type === 'percentage' ? `${coupon.value}% off` : `$${coupon.value} off`} applied
                </motion.p>
              )}
              {couponError && (
                <p className="text-red-500 text-xs mt-2.5">{couponError}</p>
              )}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 px-1">
              <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-text-light text-xs leading-relaxed">
                Your payment is processed securely. After purchase, you can read this book in the app.
                Downloading, screenshots, and printing are disabled to protect the author's work.
              </p>
            </div>
          </div>

          {/* Right — payment */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-soft sticky top-28">
              <h3 className="font-semibold text-primary text-sm mb-5">Payment Details</h3>

              {/* Price breakdown */}
              <div className="space-y-3 mb-5 text-sm">
                <div className="flex justify-between text-text-light">
                  <span>{accessType === 'buy' ? 'Book price' : `Rental (${rentalDays} days)`}</span>
                  <span>${basePrice().toFixed(2)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>−${discount().toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-warm pt-3 flex justify-between font-bold text-primary">
                  <span>Total</span>
                  <span>${finalPrice()}</span>
                </div>
              </div>

              {/* Demo notice */}
              <div className="bg-warm rounded-xl px-4 py-3 mb-5 flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-text-light mt-0.5 flex-shrink-0" />
                <p className="text-text-light text-xs leading-relaxed">
                  Demo mode — no real charge will be made.
                </p>
              </div>

              {paymentError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-xs"
                >
                  {paymentError}
                </motion.div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-primary text-white py-3.5 rounded-xl hover:bg-highlight transition-all duration-200 font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2.5"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay ${finalPrice()}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-text-light mt-3 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Secured by GrowPDF
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
