'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookCover } from '@/components/BookCard';
import { useAuth } from '@/components/AuthProvider';
import { ArrowLeft, Star, Clock, ShoppingCart, KeyRound, Loader2, BookOpen, Tag } from 'lucide-react';

export default function BookDetailPage() {
  const { bookId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('about');

  useEffect(() => {
    fetch(`/api/books/${bookId}`)
      .then(r => r.json())
      .then(d => { setBook(d.book); setLoading(false); })
      .catch(() => setLoading(false));
  }, [bookId]);

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }
  if (!book) {
    return <div className="max-w-2xl mx-auto py-24 text-center"><p className="text-text-light">Book not found.</p><Link href="/books" className="text-primary mt-4 inline-block">← Back to browse</Link></div>;
  }

  const inLibrary = user && user.library && user.library.some(l => l.bookId === bookId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-text-light hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-[280px_1fr] gap-8 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="aspect-[2/3] rounded-2xl overflow-hidden shadow-card"
        >
          <BookCover book={book} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {book.category && (
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">{book.category}</span>
          )}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text mt-2">{book.title}</h1>
          <p className="text-text-light text-lg mt-1">by <span className="text-text font-medium">{book.author}</span></p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-text-light">
            {book.rating > 0 && <span className="inline-flex items-center gap-1"><Star className="w-4 h-4 text-highlight fill-highlight" /> {book.rating.toFixed(1)}</span>}
            {book.pages && <span>· {book.pages} pages</span>}
            {book.language && <span>· {book.language}</span>}
          </div>

          <div className="mt-6 p-5 bg-warm/50 border border-warm/60 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-primary">${(book.price || 0).toFixed(2)}</span>
                {book.rentPrice > 0 && (
                  <span className="text-sm text-text-light">or ${book.rentPrice.toFixed(2)} / {book.rentDays || 14} days</span>
                )}
              </div>
              <p className="text-xs text-text-light mt-1">Lifetime access · DRM-protected reader</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {inLibrary ? (
                <Link
                  href={`/reader/${book.id}`}
                  className="inline-flex items-center gap-2 bg-accent text-cream font-semibold px-5 py-2.5 rounded-lg shadow-soft hover:shadow-medium transition-all"
                >
                  <BookOpen className="w-4 h-4" /> Read now
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => router.push(`/checkout/${book.id}?type=buy`)}
                    className="inline-flex items-center gap-2 bg-primary text-cream font-semibold px-5 py-2.5 rounded-lg shadow-soft hover:shadow-medium transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" /> Buy
                  </button>
                  {book.rentPrice > 0 && (
                    <button
                      onClick={() => router.push(`/checkout/${book.id}?type=rent`)}
                      className="inline-flex items-center gap-2 bg-cream text-text font-semibold px-5 py-2.5 rounded-lg border border-warm hover:border-primary hover:text-primary transition-colors"
                    >
                      <Clock className="w-4 h-4" /> Rent
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-6 border-b border-warm">
            <div className="flex gap-6">
              {['about', 'details'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                    tab === t ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 text-text-light leading-relaxed">
            {tab === 'about' && (
              <p className="whitespace-pre-line">{book.description || 'No description provided yet.'}</p>
            )}
            {tab === 'details' && (
              <dl className="grid sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <DetailRow label="Author" value={book.author} />
                <DetailRow label="Category" value={book.category} />
                <DetailRow label="Language" value={book.language} />
                <DetailRow label="Pages" value={book.pages} />
                <DetailRow label="ISBN" value={book.isbn} />
                <DetailRow label="Publisher" value={book.publisherName} />
                <DetailRow label="Sales" value={book.sales} />
              </dl>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <dt className="text-text-light text-xs uppercase tracking-wider min-w-[80px]">{label}</dt>
      <dd className="text-text">{value || '—'}</dd>
    </div>
  );
}
