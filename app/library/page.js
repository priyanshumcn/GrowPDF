'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BookCover } from '@/components/BookCard';
import { motion } from 'framer-motion';
import { BookOpen, Search, Filter, Loader2, Clock, ShoppingBag } from 'lucide-react';

function LibraryInner() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/users/library').then(r => r.json()).then(d => {
      setItems(d.library || []);
      setLoading(false);
    });
  }, []);

  const filtered = items.filter(it => {
    const matchesFilter = filter === 'all' || it.type === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q || (it.book?.title || '').toLowerCase().includes(q) || (it.book?.author || '').toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-text">My Library</h1>
        <p className="text-text-light mt-2">All the books you've purchased or rented.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your library..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-warm bg-cream focus:border-primary outline-none text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-warm bg-cream text-sm focus:border-primary outline-none"
        >
          <option value="all">All</option>
          <option value="buy">Owned</option>
          <option value="rent">Rented</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState hasItems={items.length > 0} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((it, i) => (
            <motion.div
              key={it.bookId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 p-4 bg-cream border border-warm/60 rounded-2xl shadow-soft hover:shadow-medium transition-shadow"
            >
              <Link href={`/reader/${it.bookId}`} className="block w-20 flex-shrink-0">
                <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-soft">
                  <BookCover book={it.book} />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/reader/${it.bookId}`}>
                  <h3 className="font-serif font-semibold text-text line-clamp-2 hover:text-primary">{it.book?.title}</h3>
                </Link>
                <p className="text-xs text-text-light mt-0.5">{it.book?.author}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {it.type === 'rent' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warm text-text-light">
                      <Clock className="w-3 h-3" /> Rent · {it.expiresAt ? new Date(it.expiresAt).toLocaleDateString() : '—'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      <ShoppingBag className="w-3 h-3" /> Owned
                    </span>
                  )}
                </div>
                <Link
                  href={`/reader/${it.bookId}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Read now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasItems }) {
  return (
    <div className="text-center py-20">
      <BookOpen className="w-12 h-12 mx-auto text-primary opacity-40 mb-3" />
      <p className="text-text-light mb-4">{hasItems ? 'No books match your filter.' : 'Your library is empty.'}</p>
      <Link href="/books" className="inline-block bg-primary text-cream font-semibold px-5 py-2.5 rounded-lg shadow-soft hover:shadow-medium transition-all">
        Browse books
      </Link>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <ProtectedRoute>
      <LibraryInner />
    </ProtectedRoute>
  );
}
