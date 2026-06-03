'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const GRADIENTS = [
  'from-amber-200 via-orange-200 to-rose-200',
  'from-emerald-200 via-teal-200 to-cyan-200',
  'from-rose-200 via-pink-200 to-fuchsia-200',
  'from-sky-200 via-blue-200 to-indigo-200',
  'from-violet-200 via-purple-200 to-pink-200',
  'from-yellow-200 via-amber-200 to-orange-200',
  'from-lime-200 via-green-200 to-emerald-200',
  'from-slate-300 via-gray-300 to-zinc-300'
];

function getCoverGradient(id) {
  let h = 0;
  for (let i = 0; i < (id || '').length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export function BookCover({ book, className = '' }) {
  const gradient = getCoverGradient(book?.id || book?.title || 'x');
  const initial = (book?.title || '?').trim()[0]?.toUpperCase() || '?';
  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-3 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/20" />
      <div className="relative z-10 text-center">
        <div className="font-serif text-3xl sm:text-4xl font-bold text-white/95 drop-shadow-md">
          {initial}
        </div>
        <div className="mt-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/85 line-clamp-2 max-w-[90%] mx-auto">
          {book?.title || ''}
        </div>
      </div>
      <div className="absolute top-2 right-2 w-1 h-12 bg-white/40 rounded-full" />
    </div>
  );
}

export default function BookCard({ book, index = 0 }) {
  if (!book) return null;
  const buy = book.price || 0;
  const rent = book.rentPrice || 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="book-card"
    >
      <Link href={`/books/${book.id}`} className="block group">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-card mb-3">
          {book.thumbnail ? (
            <img
              src={book.thumbnail}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fall back to gradient cover if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div style={{ display: book.thumbnail ? 'none' : 'flex' }} className="w-full h-full">
            <BookCover book={book} className="w-full h-full" />
          </div>
          {book.featured && (
            <div className="absolute top-2 left-2 bg-highlight text-accent text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-soft">
              Featured
            </div>
          )}
        </div>
        <h3 className="font-serif font-semibold text-base text-text line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-text-light mt-0.5 line-clamp-1">{book.author}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-primary">${buy.toFixed(2)}</span>
            {rent > 0 && <span className="text-[11px] text-text-light">or ${rent.toFixed(2)} rent</span>}
          </div>
          {book.rating > 0 && (
            <span className="text-[11px] text-text-light">★ {book.rating.toFixed(1)}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
