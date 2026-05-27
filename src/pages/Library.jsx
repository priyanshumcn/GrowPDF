import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Infinity as InfinityIcon, ArrowRight, Search, BookMarked } from 'lucide-react';
import axios from 'axios';
import { getCoverGradient } from '../components/BookCard';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const { data } = await axios.get('/api/users/library', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setBooks(data);
      } catch (error) {
        console.error('Failed to fetch library');
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesFilter = filter === 'all' || (filter === 'owned' ? book.accessType === 'buy' : book.accessType === 'rent');
    const matchesSearch = !search || book.title?.toLowerCase().includes(search.toLowerCase()) || book.author?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-10 skeleton rounded w-48 mb-8"></div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-soft">
                <div className="aspect-[3/4] skeleton"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 skeleton rounded w-3/4"></div>
                  <div className="h-3 skeleton rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-serif font-bold text-primary mb-2">My Library</h1>
            <p className="text-text-light">{books.length} books in your collection</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your library..."
                className="bg-white border-2 border-warm rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-highlight transition-colors shadow-soft"
              />
            </div>
            {/* Filter tabs */}
            <div className="flex gap-1 bg-white rounded-full p-1 shadow-soft border border-warm/50">
              {['all', 'owned', 'rented'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${filter === f ? 'bg-primary text-white shadow-sm' : 'text-text-light hover:text-primary'}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <motion.div
            className="text-center py-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-28 h-28 bg-warm rounded-full flex items-center justify-center mx-auto mb-6">
              <BookMarked className="w-14 h-14 text-text-light/30" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-primary mb-3">
              {search ? 'No matching books' : 'Your library is empty'}
            </h2>
            <p className="text-text-light mb-8 max-w-sm mx-auto">
              {search ? 'Try a different search term.' : 'Start building your collection by browsing our books.'}
            </p>
            <Link
              to="/books"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full hover:bg-highlight transition-colors font-medium"
            >
              Browse Books <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            <AnimatePresence>
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                >
                  <Link to={`/reader/${book.id}`} className="group block">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-shadow duration-300">
                      <div className="aspect-[3/4] relative overflow-hidden">
                        {book.thumbnail ? (
                          <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div
                            className="w-full h-full flex flex-col items-center justify-center p-4"
                            style={{ background: getCoverGradient(book.id) }}
                          >
                            <div className="text-center">
                              <p className="text-white font-serif font-bold text-xs leading-tight drop-shadow-sm line-clamp-3">{book.title}</p>
                              <p className="text-white/60 text-xs mt-1">{book.author}</p>
                            </div>
                          </div>
                        )}
                        {/* Access badge */}
                        <div className="absolute top-3 right-3">
                          {book.accessType === 'buy' ? (
                            <span className="bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                              <InfinityIcon className="w-3 h-3" /> Owned
                            </span>
                          ) : (
                            <span className="bg-highlight text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                              <Clock className="w-3 h-3" /> Rented
                            </span>
                          )}
                        </div>
                        {/* Read overlay */}
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 flex items-center justify-center transition-all duration-300">
                          <span className="bg-white text-primary text-xs font-semibold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-medium">
                            Read Now
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-primary text-sm mb-0.5 line-clamp-1 group-hover:text-highlight transition-colors">{book.title}</h3>
                        <p className="text-text-light text-xs mb-2">{book.author}</p>
                        {book.accessType === 'rent' && book.expiresAt && (
                          <p className="text-xs text-highlight/80">Expires {new Date(book.expiresAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
