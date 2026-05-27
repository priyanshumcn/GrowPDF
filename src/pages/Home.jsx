import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { BookOpen, ArrowRight, Star, TrendingUp, Users, Shield, Zap, Eye, Heart, Bookmark, Sparkles } from 'lucide-react';
import axios from 'axios';
import BookCard from '../components/BookCard';

const AnimatedSection = ({ children, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Minimal aesthetic book covers for hero section
const COVER_TONES = [
  { bg: '#1a1a2e', text: '#e8e4dc' },
  { bg: '#2d2d2d', text: '#f0ebe0' },
  { bg: '#1e2a3a', text: '#e8edf5' },
  { bg: '#3d3530', text: '#f5f0e8' },
];

const HERO_BOOKS = [
  { title: 'The Art of Thinking Clearly', author: 'Rolf Dobelli' },
  { title: 'Atomic Habits', author: 'James Clear' },
  { title: 'Zero to One', author: 'Peter Thiel' },
  { title: 'Deep Work', author: 'Cal Newport' },
];

const HeroBookCovers = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {HERO_BOOKS.map((book, i) => {
        const tone = COVER_TONES[i];
        return (
          <motion.div
            key={i}
            className="rounded-2xl overflow-hidden shadow-card aspect-[3/4] relative group cursor-pointer"
            style={{ backgroundColor: tone.bg }}
            whileHover={{ y: -6, rotate: i % 2 === 0 ? -0.8 : 0.8 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
          >
            {/* Subtle texture */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.8) 3px, rgba(255,255,255,0.8) 4px)',
            }} />
            {/* Spine */}
            <div className="absolute left-5 top-0 bottom-0 w-px opacity-10" style={{ backgroundColor: tone.text }} />
            {/* Top line */}
            <div className="absolute top-4 left-4 right-4 h-px opacity-10" style={{ backgroundColor: tone.text }} />
            {/* Content */}
            <div className="relative z-10 p-5 h-full flex flex-col justify-between">
              <p className="font-serif font-bold text-sm leading-snug line-clamp-3" style={{ color: tone.text, opacity: 0.9 }}>
                {book.title}
              </p>
              <p className="text-xs font-medium tracking-wide" style={{ color: tone.text, opacity: 0.35 }}>
                {book.author}
              </p>
            </div>
            {/* Hover shimmer */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
          </motion.div>
        );
      })}
    </div>
  );
};

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await axios.get('/api/books/featured');
        setFeaturedBooks(data);
      } catch (error) {
        console.error('Failed to fetch featured books');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const stats = [
    { icon: BookOpen, value: '10K+', label: 'Books Available', color: 'text-blue-500' },
    { icon: Users, value: '50K+', label: 'Active Readers', color: 'text-green-500' },
    { icon: Star, value: '4.8', label: 'Average Rating', color: 'text-yellow-500' },
    { icon: TrendingUp, value: '100K+', label: 'Books Sold', color: 'text-highlight' },
  ];

  const features = [
    { icon: Eye, title: 'Read Anywhere', description: 'Access your library from any device — desktop, mobile, or tablet — anytime you want.', color: 'from-blue-500 to-cyan-400' },
    { icon: Shield, title: 'Secure Reading', description: 'Advanced DRM protection keeps content safe. Your library is yours, protected and private.', color: 'from-green-500 to-emerald-400' },
    { icon: Zap, title: 'Instant Access', description: 'Complete your purchase and start reading in seconds. No waiting, no downloads required.', color: 'from-yellow-500 to-orange-400' },
    { icon: Heart, title: 'Curated Collection', description: 'Hand-picked books from top publishers worldwide, covering every genre and interest.', color: 'from-highlight to-pink-400' },
  ];

  const categories = [
    { name: 'Technology', bg: '#1e2a3a', count: '2,500+', emoji: '💻' },
    { name: 'Self-Help', bg: '#1e352a', count: '1,800+', emoji: '🌱' },
    { name: 'Business', bg: '#2a1e35', count: '1,200+', emoji: '📊' },
    { name: 'Finance', bg: '#35251e', count: '900+', emoji: '💰' },
    { name: 'Art & Design', bg: '#2d2d2d', count: '750+', emoji: '🎨' },
    { name: 'Philosophy', bg: '#252535', count: '600+', emoji: '🧠' },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative" style={{ background: 'linear-gradient(160deg, #faf8f5 0%, #f5f0e8 60%, #faf8f5 100%)' }}>
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-10 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #e94560, transparent)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.12, 0.08] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #667eea, transparent)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          />
          {/* Floating dots */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-highlight/30"
              style={{
                top: `${20 + i * 12}%`,
                right: `${5 + (i % 3) * 8}%`,
              }}
              animate={{ y: [0, -15, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.7 }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              <motion.div
                className="inline-flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full mb-8 shadow-soft border border-white/60"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.span
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-sm text-text-light font-medium">Over 10,000 books available now</span>
              </motion.div>
              
              <h1 className="text-6xl md:text-7xl font-serif font-bold text-primary leading-[0.95] mb-8 text-balance">
                Human
                <br />
                <span className="relative">
                  <span className="text-highlight">stories</span>
                  <motion.span
                    className="absolute -bottom-1 left-0 right-0 h-1 bg-highlight/30 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                  />
                </span>
                {' '}& ideas
              </h1>
              
              <p className="text-xl text-text-light mb-10 max-w-lg leading-relaxed">
                A place to read, discover, and deepen your understanding. 
                Buy or rent books instantly and read them anywhere.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/books"
                  className="group bg-primary text-white px-8 py-4 rounded-full hover:bg-highlight transition-all duration-300 hover:shadow-glow flex items-center gap-3 font-medium"
                >
                  Start Reading
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="group border-2 border-primary/20 text-primary px-8 py-4 rounded-full hover:border-primary hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-3"
                >
                  Become a Publisher
                  <BookOpen className="w-5 h-5" />
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-10">
                <div className="flex -space-x-2">
                  {['#667eea','#f5576c','#43e97b','#f7971e'].map((c,i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ background: c }}>
                      {['R','M','S','A'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-text-light">
                  <span className="font-semibold text-primary">50K+ readers</span> already growing
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-r from-highlight/10 to-blue-500/10 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-medium border border-white/80">
                  <HeroBookCovers />
                  <div className="mt-4 flex items-center justify-between px-1">
                    <p className="text-xs text-text-light">Featured this week</p>
                    <Link to="/books" className="text-xs text-highlight hover:underline flex items-center gap-1">
                      View all <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <AnimatedSection className="py-16 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-highlight rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <stat.icon className={`w-7 h-7 mx-auto mb-3 ${stat.color}`} />
                <div className="text-4xl font-serif font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Featured Books */}
      <AnimatedSection className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-highlight" />
                <span className="text-sm font-medium text-highlight uppercase tracking-wider">Curated for you</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-3">Featured Books</h2>
              <p className="text-text-light text-lg">Hand-picked recommendations from our editors</p>
            </div>
            <Link to="/books" className="hidden md:flex items-center gap-2 text-primary hover:text-highlight transition-colors font-medium group">
              View All <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
          ) : featuredBooks.length === 0 ? (
            // Show demo books when no data
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: 1, title: 'Atomic Habits', author: 'James Clear', price: 12.99, rating: 5, reviews: 2840 },
                { id: 2, title: 'The Psychology of Money', author: 'Morgan Housel', price: 9.99, rating: 4, reviews: 1920 },
                { id: 3, title: 'Deep Work', author: 'Cal Newport', price: 11.99, rating: 5, reviews: 3100 },
                { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', price: 14.99, rating: 4, reviews: 5200 },
              ].map((book, index) => (
                <BookCard key={book.id} book={book} index={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.slice(0, 4).map((book, index) => (
                <BookCard key={book.id} book={book} index={index} />
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Categories */}
      <AnimatedSection className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Browse Categories</h2>
            <p className="text-text-light text-lg">Find books in any genre that inspires you</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={`/books?category=${cat.name}`} className="block">
                  <div
                    className="rounded-2xl p-5 text-white text-center hover:opacity-90 transition-all duration-300 relative overflow-hidden"
                    style={{ backgroundColor: cat.bg }}
                  >
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)' }} />
                    <div className="text-2xl mb-2 relative z-10">{cat.emoji}</div>
                    <h3 className="font-semibold text-sm mb-1 relative z-10 text-white/90">{cat.name}</h3>
                    <p className="text-white/40 text-xs relative z-10">{cat.count} books</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Features */}
      <AnimatedSection className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Bookmark className="w-5 h-5 text-highlight" />
              <span className="text-sm font-medium text-highlight uppercase tracking-wider">Why choose us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Why GrowPDF?</h2>
            <p className="text-text-light text-lg max-w-2xl mx-auto">Experience reading like never before with our premium platform</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 group border border-white/80"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-3">{feature.title}</h3>
                <p className="text-text-light text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-highlight/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 7, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, delay: 2 }}
          />
          {/* Stars pattern */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{ top: `${10 + (i * 7) % 80}%`, left: `${5 + (i * 11) % 90}%` }}
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
              Start Your Reading<br />Journey Today
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of readers who have discovered their next favorite book on GrowPDF.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="bg-highlight text-white px-10 py-4 rounded-full hover:bg-white hover:text-primary transition-all duration-300 text-lg font-medium shadow-glow hover:shadow-none"
              >
                Get Started Free
              </Link>
              <Link
                to="/books"
                className="border-2 border-white/20 text-white px-10 py-4 rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300 text-lg"
              >
                Browse Books
              </Link>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Home;
