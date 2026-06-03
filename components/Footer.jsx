'use client';

import Link from 'next/link';
import { BookOpen, Twitter, Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-warm border-t border-warm/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-cream" />
              </div>
              <span className="font-serif font-bold text-xl text-accent">GrowPDF</span>
            </div>
            <p className="text-text-light text-sm max-w-md">
              A minimalist book platform for readers, publishers, and admins. Discover, buy, and read — beautifully.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-text mb-3 text-sm">Explore</h4>
            <ul className="space-y-2 text-sm text-text-light">
              <li><Link href="/books" className="hover:text-primary">Browse</Link></li>
              <li><Link href="/library" className="hover:text-primary">My Library</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary">For Publishers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text mb-3 text-sm">Account</h4>
            <ul className="space-y-2 text-sm text-text-light">
              <li><Link href="/login" className="hover:text-primary">Sign in</Link></li>
              <li><Link href="/register" className="hover:text-primary">Create account</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-warm/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-light">© {new Date().getFullYear()} GrowPDF. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a href="mailto:hello@growpdf.app" className="p-2 rounded-lg hover:bg-cream text-text-light hover:text-primary"><Mail className="w-4 h-4" /></a>
            <a href="#" className="p-2 rounded-lg hover:bg-cream text-text-light hover:text-primary"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="p-2 rounded-lg hover:bg-cream text-text-light hover:text-primary"><Github className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
