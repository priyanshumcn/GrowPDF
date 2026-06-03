'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, BookOpen, Users, Star, ShieldCheck, CreditCard, Zap, BookMarked, Compass } from 'lucide-react';
import BookCard from '@/components/BookCard';

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6 }
};

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [f, n] = await Promise.all([
          fetch('/api/books/featured').then(r => r.json()),
          fetch('/api/books/new-releases').then(r => r.json())
        ]);
        setFeatured(f.books || []);
        setNewReleases(n.books || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <Hero />
      <Stats />
      <FeaturedSection books={featured} loading={loading} />
      <Categories />
      <Features />
      <NewReleases books={newReleases} loading={loading} />
      <CTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-warm via-cream to-rose-100/40" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 -left-24 w-96 h-96 bg-highlight/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream border border-warm text-xs font-semibold text-accent mb-6 shadow-soft">
            <Sparkles className="w-3.5 h-3.5" />
            A minimalist book platform
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-text leading-[1.05] tracking-tight">
            Read more.<br />
            <span className="text-primary">Carry less.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-text-light max-w-2xl leading-relaxed">
            Discover, buy, and read beautifully designed books. Built for readers, publishers, and dreamers.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/books"
              className="inline-flex items-center justify-center gap-2 bg-primary text-cream font-semibold px-6 py-3.5 rounded-xl shadow-medium hover:shadow-glow transition-all hover:-translate-y-0.5"
            >
              Browse the library <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-cream text-text font-semibold px-6 py-3.5 rounded-xl border border-warm hover:border-primary hover:text-primary transition-colors"
            >
              Create an account
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { icon: BookOpen, value: '10k+', label: 'Books' },
    { icon: Users, value: '50k+', label: 'Readers' },
    { icon: Star, value: '4.9', label: 'Rating' }
  ];
  return (
    <section className="border-y border-warm/60 bg-cream/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-3 gap-6 sm:gap-12">
          {items.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <s.icon className="w-7 h-7 mx-auto text-primary mb-2" />
              <div className="font-serif text-3xl sm:text-4xl font-bold text-text">{s.value}</div>
              <div className="text-xs sm:text-sm text-text-light mt-1 uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedSection({ books, loading }) {
  if (loading) return null;
  if (!books.length) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div {...fade} className="flex items-end justify-between mb-10">
        <div>
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Featured</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text mt-1">Editor's picks</h2>
        </div>
        <Link href="/books" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
        {books.slice(0, 4).map((b, i) => <BookCard key={b.id} book={b} index={i} />)}
      </div>
    </section>
  );
}

function Categories() {
  const cats = [
    { name: 'Fiction', gradient: 'from-rose-200 to-pink-300' },
    { name: 'Non-Fiction', gradient: 'from-amber-200 to-orange-300' },
    { name: 'Self-Help', gradient: 'from-emerald-200 to-teal-300' },
    { name: 'Science', gradient: 'from-sky-200 to-indigo-300' },
    { name: 'History', gradient: 'from-yellow-200 to-amber-300' },
    { name: 'Poetry', gradient: 'from-violet-200 to-purple-300' }
  ];
  return (
    <section className="bg-warm/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div {...fade} className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Explore</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text mt-1">Browse by category</h2>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {cats.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/books?category=${encodeURIComponent(c.name)}`}
                className="block aspect-square rounded-2xl bg-gradient-to-br shadow-soft hover:shadow-medium transition-all hover:-translate-y-1 overflow-hidden relative"
                style={{ background: '' }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient}`} />
                <div className="relative h-full flex flex-col items-center justify-center p-3 text-center">
                  <Compass className="w-6 h-6 text-white/80 mb-2" />
                  <span className="font-serif font-semibold text-white drop-shadow-md text-sm sm:text-base">{c.name}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: BookMarked, title: 'Built for reading', body: 'A clean, distraction-free reader with bookmarks, themes, and zoom — exactly as it should be.' },
    { icon: ShieldCheck, title: 'Protected content', body: 'Anti-download, anti-screenshot, and screen-recording guards keep publisher content safe.' },
    { icon: CreditCard, title: 'Buy or rent', body: 'Own a book forever, or rent it for a few days. Pay securely with cards, UPI, or coupons.' },
    { icon: Zap, title: 'Fast & offline', body: 'Lightning-fast page loads, smooth animations, and a thoughtfully minimal design.' }
  ];
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div {...fade} className="text-center mb-12">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider">Why GrowPDF</p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text mt-1">Built for the love of books</h2>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-cream border border-warm/60 rounded-2xl p-6 shadow-soft hover:shadow-medium transition-shadow"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-text">{f.title}</h3>
            <p className="text-sm text-text-light mt-2 leading-relaxed">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function NewReleases({ books, loading }) {
  if (loading) return null;
  if (!books.length) return null;
  return (
    <section className="bg-warm/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div {...fade} className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Just in</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text mt-1">New releases</h2>
          </div>
          <Link href="/books?sort=newest" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
            See more <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {books.slice(0, 5).map((b, i) => <BookCard key={b.id} book={b} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        {...fade}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-10 sm:p-16 text-center text-cream shadow-glow"
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold">Ready to start reading?</h2>
          <p className="mt-3 text-cream/85 max-w-xl mx-auto">Join thousands of readers on GrowPDF and find your next favorite book today.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-cream text-accent font-semibold px-6 py-3.5 rounded-xl shadow-soft hover:shadow-medium transition-all"
            >
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/books"
              className="inline-flex items-center justify-center gap-2 border border-cream/40 text-cream font-semibold px-6 py-3.5 rounded-xl hover:bg-cream/10 transition-colors"
            >
              Browse books
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
