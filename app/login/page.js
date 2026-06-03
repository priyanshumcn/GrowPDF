'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/';
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError('');
    const mockToken = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })) + '.' +
      btoa(JSON.stringify({
        sub: 'demo-' + Date.now(),
        email: prompt('Enter your Gmail for demo Google sign-in:') || '',
        name: 'Demo User',
        picture: ''
      })) + '.demo';
    setLoading(true);
    try {
      await googleLogin(mockToken);
      router.push(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cream" />
            </div>
            <span className="font-serif font-bold text-2xl text-accent">GrowPDF</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-text">Welcome back</h1>
          <p className="text-text-light text-sm mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={onSubmit} className="bg-cream border border-warm/60 rounded-2xl p-6 sm:p-8 shadow-soft space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-warm bg-warm/30 focus:bg-cream focus:border-primary outline-none text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-warm bg-warm/30 focus:bg-cream focus:border-primary outline-none text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-light hover:text-primary p-1"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-cream font-semibold py-2.5 rounded-lg shadow-soft hover:shadow-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
          </button>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-warm" /></div>
            <div className="relative flex justify-center"><span className="bg-cream px-3 text-xs text-text-light uppercase">or</span></div>
          </div>
          <button
            type="button"
            onClick={onGoogle}
            disabled={loading}
            className="w-full border border-warm bg-cream text-text font-medium py-2.5 rounded-lg hover:border-primary hover:text-primary transition-colors text-sm"
          >
            Continue with Google
          </button>
        </form>

        <p className="text-center text-sm text-text-light mt-6">
          New here? <Link href="/register" className="text-primary font-semibold hover:underline">Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
}
