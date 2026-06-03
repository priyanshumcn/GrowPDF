'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, BookOpen, Users, TrendingUp, CheckCircle2, XCircle, Loader2, X, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [tab, setTab] = useState('pending');
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/pending').then(r => r.json())
    ]).then(([s, p]) => {
      setStats(s.stats);
      setPending(p.books || []);
    }).finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    const [s, p] = await Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/pending').then(r => r.json())
    ]);
    setStats(s.stats);
    setPending(p.books || []);
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-4xl font-bold text-text mb-2">Admin Panel</h1>
        <p className="text-text-light mb-8">Manage books, users, and platform analytics.</p>

        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Users" value={stats?.totalUsers ?? '—'} />
          <StatCard icon={BookOpen} label="Books" value={stats?.totalBooks ?? '—'} />
          <StatCard icon={TrendingUp} label="Sales" value={stats?.totalSales ?? '—'} />
          <StatCard icon={TrendingUp} label="Revenue" value={stats?.totalRevenue != null ? `$${stats.totalRevenue.toFixed(2)}` : '—'} />
        </div>

        <div className="flex gap-1 border-b border-warm mb-8">
          {[
            { id: 'pending', label: 'Pending', count: pending.filter(b => b.status === 'pending').length },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'analytics', label: 'Analytics' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text'
              }`}
            >
              {t.label} {t.count != null && <span className="bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5">{t.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : (
          <>
            {tab === 'pending' && <PendingTab books={pending.filter(b => b.status === 'pending')} onUpdate={refresh} />}
            {tab === 'approved' && <ApprovedTab />}
            {tab === 'rejected' && <RejectedTab books={pending.filter(b => b.status === 'rejected')} />}
            {tab === 'analytics' && <AnalyticsTab stats={stats} />}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-cream border border-warm/60 rounded-2xl p-5 shadow-soft">
      <Icon className="w-5 h-5 text-primary mb-2" />
      <div className="font-serif text-2xl font-bold text-text">{value}</div>
      <div className="text-xs text-text-light uppercase tracking-wider">{label}</div>
    </div>
  );
}

function PendingTab({ books, onUpdate }) {
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason] = useState('');

  const approve = async (id) => {
    await fetch(`/api/admin/approve/${id}`, { method: 'POST' });
    onUpdate();
  };
  const reject = async (id) => {
    await fetch(`/api/admin/reject/${id}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reason }) });
    setRejectId(null);
    setReason('');
    onUpdate();
  };

  return (
    <div className="space-y-4">
      {books.length === 0 && <p className="text-text-light">No pending books.</p>}
      {books.map(b => (
        <div key={b.id} className="bg-cream border border-warm/60 rounded-2xl p-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif font-semibold text-lg text-text">{b.title}</h3>
              <p className="text-sm text-text-light">by {b.author} · ${b.price?.toFixed(2)}</p>
              <p className="text-xs text-text-light mt-1">Uploaded by {b.publisherName || 'Unknown'} · {b.submittedAt ? new Date(b.submittedAt).toLocaleDateString() : ''}</p>
              {b.description && <p className="text-sm text-text-light mt-2 line-clamp-2">{b.description}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => approve(b.id)} className="px-4 py-2 bg-success text-cream text-sm font-medium rounded-lg hover:opacity-90 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => setRejectId(b.id)} className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        </div>
      ))}
      <AnimatePresence>
        {rejectId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4"
            onClick={() => setRejectId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-cream rounded-2xl p-6 shadow-medium w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-serif text-lg font-semibold mb-1">Reject book</h3>
              <p className="text-sm text-text-light mb-4">Provide a reason (optional):</p>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Why is this being rejected?…"
                className="w-full px-4 py-2.5 rounded-lg border border-warm bg-warm/30 focus:bg-cream focus:border-primary outline-none text-sm resize-none" />
              <div className="flex gap-2 mt-4">
                <button onClick={() => setRejectId(null)} className="flex-1 px-4 py-2.5 border border-warm rounded-lg text-sm">Cancel</button>
                <button onClick={() => reject(rejectId)} className="flex-1 px-4 py-2.5 bg-red-600 text-cream rounded-lg text-sm font-medium">Reject</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ApprovedTab() {
  return <p className="text-text-light">Approved books listing coming soon.</p>;
}

function RejectedTab({ books }) {
  if (!books.length) return <p className="text-text-light">No rejected books.</p>;
  return (
    <div className="space-y-3">
      {books.map(b => (
        <div key={b.id} className="bg-cream border border-warm/60 rounded-2xl p-4 shadow-soft">
          <h3 className="font-serif font-semibold text-text">{b.title}</h3>
          <p className="text-xs text-text-light">by {b.author} · rejected {b.rejectedAt ? new Date(b.rejectedAt).toLocaleDateString() : ''}</p>
          {b.rejectionReason && <p className="text-xs text-red-600 mt-1">Reason: {b.rejectionReason}</p>}
        </div>
      ))}
    </div>
  );
}

function AnalyticsTab({ stats }) {
  if (!stats) return <p className="text-text-light">Loading analytics…</p>;
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="bg-cream border border-warm/60 rounded-2xl p-5 shadow-soft">
        <p className="text-xs text-text-light uppercase tracking-wider mb-1">Pending Books</p>
        <p className="font-serif text-2xl font-bold text-text">{stats.pendingBooks ?? 0}</p>
      </div>
      <div className="bg-cream border border-warm/60 rounded-2xl p-5 shadow-soft">
        <p className="text-xs text-text-light uppercase tracking-wider mb-1">Rejected Books</p>
        <p className="font-serif text-2xl font-bold text-text">{stats.rejectedBooks ?? 0}</p>
      </div>
      <div className="bg-cream border border-warm/60 rounded-2xl p-5 shadow-soft">
        <p className="text-xs text-text-light uppercase tracking-wider mb-1">Approved Books</p>
        <p className="font-serif text-2xl font-bold text-text">{stats.totalBooks ?? 0}</p>
      </div>
      <div className="bg-cream border border-warm/60 rounded-2xl p-5 shadow-soft">
        <p className="text-xs text-text-light uppercase tracking-wider mb-1">Total Users</p>
        <p className="font-serif text-2xl font-bold text-text">{stats.totalUsers ?? 0}</p>
      </div>
    </div>
  );
}
