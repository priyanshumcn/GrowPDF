import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Filter, BookOpen, SlidersHorizontal, Search, X } from 'lucide-react';
import axios from 'axios';
import BookCard from '../components/BookCard';

const DEMO_BOOKS = [
  { id: 1, title: 'Atomic Habits', author: 'James Clear', price: 12.99, rating: 5, reviews: 2840, pages: 320, category: 'Self-Help' },
  { id: 2, title: 'The Psychology of Money', author: 'Morgan Housel', price: 9.99, rating: 4, reviews: 1920, pages: 256, category: 'Finance' },
  { id: 3, title: 'Deep Work', author: 'Cal Newport', price: 11.99, rating: 5, reviews: 3100, pages: 304, category: 'Self-Help' },
  { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', price: 14.99, rating: 4, reviews: 5200, pages: 443, category: 'Philosophy' },
  { id: 5, title: 'Zero to One', author: 'Peter Thiel', price: 10.99, rating: 5, reviews: 1800, pages: 224, category: 'Business' },
  { id: 6, title: 'Clean Code', author: 'Robert C. Martin', price: 15.99, rating: 4, reviews: 4100, pages: 464, category: 'Technology' },
  { id: 7, title: 'The Design of Everyday Things', author: 'Don Norman', price: 13.99, rating: 5, reviews: 2200, pages: 368, category: 'Art & Design' },
  { id: 8, title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', price: 8.99, rating: 4, reviews: 6800, pages: 207, category: 'Finance' },
  { id: 9, title: 'Thinking Fast and Slow', author: 'Daniel Kahneman', price: 13.99, rating: 5, reviews: 3900, pages: 512, category: 'Philosophy' },
  { id: 10, title: 'The Lean Startup', author: 'Eric Ries', price: 11.99, rating: 4, reviews: 2700, pages: 336, category: 'Business' },
  { id: 11, title: 'React in Action', author: 'Mark Tielens Thomas', price: 16.99, rating: 4, reviews: 890, pages: 360, category: 'Technology' },
  { id: 12, title: 'Meditations', author: 'Marcus Aurelius', price: 7.99, rating: 5, reviews: 7800, pages: 256, category: 'Philosophy' },
];

const Books = () => {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);
        if (sortBy) params.append('sort', sortBy);

        const [booksRes, categoriesRes] = await Promise.all([
          axios.get(`/api/books?${params}`),
          axios.get('/api/books/categories'),
        ]);
        setBooks(booksRes.data.books);
        setCategories(categoriesRes.data);
      } catch (error) {
        // Use demo data when API not available
        let filtered = DEMO_BOOKS;
        if (selectedCategory !== 'all') filtered = filtered.filter(b => b.category === selectedCategory);
        if (searchQuery) filtered = filtered.filter(b =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setBooks(filtered);
        setCategories(['Technology', 'Self-Help', 'Business', 'Finance', 'Art & Design', 'Philosophy']);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory, sortBy, searchQuery]);

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <motion.h1
            className="text-4xl md:text-5xl font-serif font-bold text-primary mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {searchQuery ? `Results for "${searchQuery}"` : selectedCategory !== 'all' ? selectedCategory : 'Browse Books'}
          </motion.h1>
          <p className="text-text-light text-lg">
            {books.length > 0 ? `${books.length} books found` : 'Discover your next favorite read'}
          </p>
        </div>

        {/* Mobile search */}
        <div className="mb-6 relative lg:hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books or authors..."
            className="w-full bg-white border-2 border-warm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-highlight transition-colors shadow-soft"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-text-light" />
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-60 flex-shrink-0">
            {/* Mobile toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-soft mb-3 font-medium"
            >
              <span className="flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters</span>
              <motion.span animate={{ rotate: showFilters ? 180 : 0 }}>▼</motion.span>
            </button>

            <AnimatePresence>
              {(showFilters || true) && (
                <motion.div
                  className={`bg-white rounded-2xl p-6 shadow-soft sticky top-28 ${!showFilters ? 'hidden lg:block' : ''}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="space-y-6">
                    {/* Search - desktop */}
                    <div className="hidden lg:block relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-warm rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30 transition-colors"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-1.5">
                        <Filter className="w-4 h-4" /> Category
                      </h4>
                      <div className="space-y-1">
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'all' ? 'bg-primary text-white font-medium' : 'text-text-light hover:bg-warm hover:text-primary'}`}
                        >
                          All Books
                        </button>
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat ? 'bg-primary text-white font-medium' : 'text-text-light hover:bg-warm hover:text-primary'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sort */}
                    <div>
                      <h4 className="text-sm font-semibold text-primary mb-3">Sort By</h4>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-warm rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30"
                      >
                        <option value="newest">Newest First</option>
                        <option value="popular">Most Popular</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-soft">
                    <div className="aspect-[3/4] skeleton"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 skeleton rounded w-4/5"></div>
                      <div className="h-3 skeleton rounded w-3/5"></div>
                      <div className="h-3 skeleton rounded w-2/5"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : books.length === 0 ? (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-24 h-24 bg-warm rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-text-light/40" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">No books found</h3>
                <p className="text-text-light mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  className="bg-primary text-white px-6 py-3 rounded-full hover:bg-highlight transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                layout
              >
                <AnimatePresence>
                  {books.map((book, index) => (
                    <BookCard key={book.id} book={book} index={index} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Books;
