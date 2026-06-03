'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BookCard from '@/components/BookCard';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';

function BooksInner() {
  const params = useSearchParams();
  const initialCategory = params.get('category') || 'all';
  const initialSort = params.get('sort') || 'newest';
  const initialSearch = params.get('search') || '';

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch('/api/books/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (category && category !== 'all') qs.set('category', category);
    if (search) qs.set('search', search);
    if (sort) qs.set('sort', sort);
    qs.set('page', String(page));
    qs.set('limit', '24');
    fetch('/api/books?' + qs.toString())
      .then(r => r.json())
      .then(d => { setBooks(d.books || []); setTotal(d.total || 0); })
      .finally(() => setLoading(false));
  }, [category, sort, search, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-text">Browse books</h1>
        <p className="text-text-light mt-2">Find your next great read from our growing collection.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, author..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-warm bg-cream focus:border-primary outline-none text-sm"
          />
        </div>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-lg border border-warm bg-cream text-sm focus:border-primary outline-none"
        >
          <option value="all">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-lg border border-warm bg-cream text-sm focus:border-primary outline-none"
        >
          <option value="newest">Newest</option>
          <option value="bestselling">Bestselling</option>
          <option value="rating">Top rated</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : books.length === 0 ? (
        <div className="text-center py-24 text-text-light">
          <SlidersHorizontal className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No books match your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {books.map((b, i) => <BookCard key={b.id} book={b} index={i} />)}
          </div>
          {total > books.length && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-2.5 rounded-lg border border-warm bg-cream hover:border-primary hover:text-primary text-sm font-medium"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
    }>
      <BooksInner />
    </Suspense>
  );
}
