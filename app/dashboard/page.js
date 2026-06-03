'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, BookOpen, BarChart3, Settings, FileText, Loader2, CheckCircle2, X, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [tab, setTab] = useState('overview');

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-4xl font-bold text-text mb-2">Publisher Dashboard</h1>
        <p className="text-text-light mb-8">Upload, manage, and track your books.</p>
        <div className="flex gap-1 border-b border-warm mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'upload', label: 'Upload Book', icon: Upload },
            { id: 'mybooks', label: 'My Books', icon: BookOpen },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {tab === 'overview' && <Overview />}
            {tab === 'upload' && <UploadBook />}
            {tab === 'mybooks' && <MyBooks />}
            {tab === 'settings' && <SettingsPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}

function Overview() {
  const { user } = useAuth();
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <StatCard icon={BookOpen} label="Published" value="—" />
      <StatCard icon={Upload} label="Pending Approval" value="—" />
      <StatCard icon={BarChart3} label="Total Sales" value="—" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-cream border border-warm/60 rounded-2xl p-5 shadow-soft">
      <Icon className="w-5 h-5 text-primary mb-2" />
      <div className="font-serif text-2xl font-bold text-text">{value}</div>
      <div className="text-xs text-text-light uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function UploadBook() {
  const { api } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('9.99');
  const [rentPrice, setRentPrice] = useState('2.99');
  const [rentDays, setRentDays] = useState('14');
  const [isbn, setIsbn] = useState('');
  const [pages, setPages] = useState('');
  const [language, setLanguage] = useState('English');
  const [pdfFile, setPdfFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const pdfRef = useRef(null);
  const thumbRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!pdfFile) { setError('Please select a PDF file'); return; }
    if (pdfFile.size > 50 * 1024 * 1024) { setError('PDF must be under 50 MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', title); fd.append('author', author); fd.append('description', description);
      fd.append('category', category); fd.append('price', price); fd.append('rentPrice', rentPrice);
      fd.append('rentDays', rentDays); fd.append('isbn', isbn); fd.append('pages', pages || '0');
      fd.append('language', language); fd.append('pdf', pdfFile);
      if (thumbFile) fd.append('thumbnail', thumbFile);
      const data = await api('/api/books/upload', { method: 'POST', body: fd });
      setResult(data.book);
      setTitle(''); setAuthor(''); setDescription(''); setCategory('');
      setPrice('9.99'); setRentPrice('2.99'); setPages(''); setIsbn('');
      setPdfFile(null); setThumbFile(null);
      if (pdfRef.current) pdfRef.current.value = '';
      if (thumbRef.current) thumbRef.current.value = '';
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      {error && <p className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</p>}
      {result && (
        <p className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Submitted for review — "{result.title}" by {result.author}
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Title" value={title} onChange={setTitle} required />
        <Input label="Author" value={author} onChange={setAuthor} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-warm bg-warm/30 focus:bg-cream focus:border-primary outline-none text-sm resize-none" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Category" value={category} onChange={setCategory} placeholder="e.g. Fiction, Science" required />
        <Input label="Language" value={language} onChange={setLanguage} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Price ($)" type="number" value={price} onChange={setPrice} step="0.01" required />
        <Input label="Rent price ($)" type="number" value={rentPrice} onChange={setRentPrice} step="0.01" />
        <Input label="Rent duration (days)" type="number" value={rentDays} onChange={setRentDays} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="ISBN (optional)" value={isbn} onChange={setIsbn} />
        <Input label="Pages (optional)" type="number" value={pages} onChange={setPages} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <FileInput ref={pdfRef} label="PDF *" onChange={f => setPdfFile(f)} accept=".pdf" />
        <FileInput ref={thumbRef} label="Thumbnail (image)" onChange={f => setThumbFile(f)} accept="image/*" />
      </div>
      <button type="submit" disabled={uploading}
        className="bg-primary text-cream font-semibold px-6 py-2.5 rounded-lg shadow-soft hover:shadow-medium transition-all disabled:opacity-60 flex items-center gap-2">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? 'Uploading…' : 'Submit for review'}
      </button>
    </form>
  );
}

const Input = ({ label, type = 'text', value, onChange, required, step, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-text mb-1">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} step={step} placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-lg border border-warm bg-warm/30 focus:bg-cream focus:border-primary outline-none text-sm" />
  </div>
);

const FileInput = ({ label, onChange, accept, ref }) => (
  <div>
    <label className="block text-sm font-medium text-text mb-1">{label}</label>
    <input type="file" ref={ref} accept={accept} onChange={e => onChange(e.target.files?.[0] || null)}
      className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-cream hover:file:opacity-90" />
  </div>
);

function MyBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/books').then(r => r.json()).then(d => {
      setBooks(d.books || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.length === 0 && <p className="text-text-light col-span-full">No books uploaded yet.</p>}
      {books.map(b => (
        <div key={b.id} className="bg-cream border border-warm/60 rounded-2xl p-4 shadow-soft">
          <h3 className="font-serif font-semibold text-text">{b.title}</h3>
          <p className="text-xs text-text-light">{b.author} · ${b.price?.toFixed(2)} · {b.sales || 0} sales</p>
        </div>
      ))}
    </div>
  );
}

function SettingsPanel() {
  const { user } = useAuth();
  return (
    <div className="max-w-xl space-y-4">
      <p className="text-sm text-text-light">Account settings will be available soon.</p>
      <div className="bg-cream border border-warm/60 rounded-2xl p-5 shadow-soft">
        <p className="font-semibold text-text">{user?.name}</p>
        <p className="text-sm text-text-light">{user?.email} · {user?.role}</p>
      </div>
    </div>
  );
}
