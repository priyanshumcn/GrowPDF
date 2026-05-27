import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, BookOpen, Clock, Download, Shield, ArrowLeft, ShoppingCart, Heart, Share2, Tag } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getCoverGradient } from '../components/BookCard';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [rentalDays, setRentalDays] = useState(7);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await axios.get(`/api/books/${id}`);
        setBook(data);
      } catch (error) {
        console.error('Failed to fetch book');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-warm rounded w-32 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="aspect-[3/4] bg-warm rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-10 bg-warm rounded w-3/4"></div>
                <div className="h-6 bg-warm rounded w-1/2"></div>
                <div className="h-24 bg-warm rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-primary mb-4">Book not found</h2>
          <Link to="/books" className="text-highlight hover:underline">Browse all books</Link>
        </div>
      </div>
    );
  }

  const handleBuy = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/checkout/${book.id}?type=buy`);
  };

  const handleRent = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/checkout/${book.id}?type=rent&days=${rentalDays}`);
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/books" className="inline-flex items-center gap-2 text-text-light hover:text-highlight transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to books
        </Link>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="aspect-[3/4] rounded-2xl shadow-medium flex items-center justify-center relative overflow-hidden"
              style={{ background: book.thumbnail ? undefined : getCoverGradient(book.id) }}
            >
              {book.thumbnail ? (
                <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-end justify-end p-8">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-6">
                      <p className="text-white font-serif font-bold text-2xl leading-tight drop-shadow-lg mb-3">{book.title}</p>
                      <p className="text-white/70 text-lg">{book.author}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur px-4 py-2 rounded-full text-lg font-bold text-primary shadow-soft">
                ${book.price}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-highlight/10 text-highlight px-3 py-1 rounded-full text-sm font-medium">{book.category}</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{book.rating}</span>
                <span className="text-text-light">({book.reviews} reviews)</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">{book.title}</h1>
            <p className="text-xl text-text-light mb-6">by {book.author}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="text-sm text-text-light mb-1">Pages</div>
                <div className="font-semibold text-primary">{book.pages}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="text-sm text-text-light mb-1">Language</div>
                <div className="font-semibold text-primary">{book.language}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="text-sm text-text-light mb-1">Publisher</div>
                <div className="font-semibold text-primary">{book.publisher}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="text-sm text-text-light mb-1">Published</div>
                <div className="font-semibold text-primary">{new Date(book.publishedDate).getFullYear()}</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <button
                onClick={handleBuy}
                className="w-full bg-primary text-white py-4 rounded-xl hover:bg-highlight transition-all duration-300 font-medium flex items-center justify-center gap-3 text-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Buy Now - ${book.price}
              </button>
              
              <div className="bg-white rounded-xl p-4 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-primary">Rent for</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRentalDays(Math.max(1, rentalDays - 1))}
                      className="w-8 h-8 bg-warm rounded-lg flex items-center justify-center hover:bg-highlight hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{rentalDays}</span>
                    <button
                      onClick={() => setRentalDays(Math.min(365, rentalDays + 1))}
                      className="w-8 h-8 bg-warm rounded-lg flex items-center justify-center hover:bg-highlight hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleRent}
                  className="w-full border-2 border-primary text-primary py-3 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 font-medium flex items-center justify-center gap-3"
                >
                  <Clock className="w-5 h-5" />
                  Rent for {rentalDays} days - ${(book.rentalPrice * rentalDays).toFixed(2)}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-text-light">
              <button className="flex items-center gap-2 hover:text-highlight transition-colors">
                <Heart className="w-5 h-5" />
                Wishlist
              </button>
              <button className="flex items-center gap-2 hover:text-highlight transition-colors">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </motion.div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="flex border-b border-warm">
            {['description', 'details', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize transition-colors ${activeTab === tab ? 'text-highlight border-b-2 border-highlight' : 'text-text-light hover:text-primary'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="p-8">
            {activeTab === 'description' && (
              <div>
                <p className="text-text-light leading-relaxed text-lg">{book.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {book.tags?.map(tag => (
                    <span key={tag} className="bg-warm px-3 py-1 rounded-full text-sm text-text-light flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'details' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-primary mb-4">Book Details</h4>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-text-light">ISBN</dt>
                      <dd className="font-medium">{book.isbn}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-light">Pages</dt>
                      <dd className="font-medium">{book.pages}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-light">Language</dt>
                      <dd className="font-medium">{book.language}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-light">Publisher</dt>
                      <dd className="font-medium">{book.publisher}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-light">Published</dt>
                      <dd className="font-medium">{book.publishedDate}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-4">Security Features</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-text-light">
                      <Shield className="w-5 h-5 text-green-500" />
                      DRM Protected
                    </li>
                    <li className="flex items-center gap-3 text-text-light">
                      <Shield className="w-5 h-5 text-green-500" />
                      No Download Allowed
                    </li>
                    <li className="flex items-center gap-3 text-text-light">
                      <Shield className="w-5 h-5 text-green-500" />
                      Screenshot Protection
                    </li>
                    <li className="flex items-center gap-3 text-text-light">
                      <Shield className="w-5 h-5 text-green-500" />
                      In-App Reading Only
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">{book.rating} out of 5</h3>
                <p className="text-text-light">{book.reviews} reviews</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
