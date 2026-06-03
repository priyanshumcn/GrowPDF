'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, LogOut, LayoutDashboard, Shield, Menu, X, Search, Library } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setUserMenu(false); }, [pathname]);

  const onLogout = async () => {
    await logout();
    router.push('/');
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/books', label: 'Browse' }
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-cream/90 backdrop-blur-md shadow-soft' : 'bg-cream/70 backdrop-blur'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow">
            <BookOpen className="w-5 h-5 text-cream" />
          </div>
          <span className="font-serif font-bold text-xl text-accent">GrowPDF</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                pathname === l.href ? 'text-primary' : 'text-text-light hover:text-primary'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {!user && (
            <>
              <Link href="/login" className="text-sm font-medium text-text-light hover:text-primary px-3 py-2">
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-primary text-cream px-4 py-2 rounded-lg shadow-soft hover:shadow-medium transition-all hover:-translate-y-0.5"
              >
                Get started
              </Link>
            </>
          )}
          {user && (
            <div className="relative">
              <button
                onClick={() => setUserMenu(o => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-warm transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-light to-primary text-cream flex items-center justify-center text-sm font-semibold">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-text">{user.name?.split(' ')[0]}</span>
              </button>
              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 mt-2 w-56 bg-cream rounded-xl shadow-medium border border-warm/60 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-warm">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-text-light">{user.email}</p>
                    </div>
                    <MenuLink href="/library" icon={Library} label="My Library" />
                    {(user.role === 'publisher' || user.role === 'admin') && (
                      <MenuLink href="/dashboard" icon={LayoutDashboard} label="Publisher Dashboard" />
                    )}
                    {user.role === 'admin' && (
                      <MenuLink href="/admin" icon={Shield} label="Admin Panel" />
                    )}
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm hover:bg-warm text-text"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden p-2 rounded-lg hover:bg-warm"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-warm overflow-hidden bg-cream"
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              {links.map(l => (
                <Link key={l.href} href={l.href} className="px-3 py-2 rounded-lg hover:bg-warm text-sm font-medium">
                  {l.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link href="/library" className="px-3 py-2 rounded-lg hover:bg-warm text-sm font-medium">My Library</Link>
                  {(user.role === 'publisher' || user.role === 'admin') && (
                    <Link href="/dashboard" className="px-3 py-2 rounded-lg hover:bg-warm text-sm font-medium">Dashboard</Link>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin" className="px-3 py-2 rounded-lg hover:bg-warm text-sm font-medium">Admin</Link>
                  )}
                  <button onClick={onLogout} className="px-3 py-2 text-left rounded-lg hover:bg-warm text-sm font-medium text-primary">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-3 py-2 rounded-lg hover:bg-warm text-sm font-medium">Sign in</Link>
                  <Link href="/register" className="px-3 py-2 rounded-lg bg-primary text-cream text-sm font-semibold text-center">Get started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuLink({ href, icon: Icon, label }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-warm text-text">
      <Icon className="w-4 h-4" /> {label}
    </Link>
  );
}
