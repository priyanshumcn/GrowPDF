import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Check, X, Eye, DollarSign, Users, 
  TrendingUp, AlertCircle, Search, RefreshCw, ShieldCheck,
  BookMarked, BarChart3, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getCoverGradient } from '../components/BookCard';

const StatCard = ({ icon: Icon, label, value, color, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl p-6 shadow-soft relative overflow-hidden"
    whileHover={{ y: -3 }}
  >
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-10" style={{ background: gradient }}></div>
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="text-3xl font-bold text-primary mb-1">{value}</div>
    <div className="text-sm text-text-light">{label}</div>
  </motion.div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingBooks, setPendingBooks] = useState([]);
  const [approvedBooks, setApprovedBooks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [pendingRes, statsRes] = await Promise.all([
        axios.get('/api/admin/pending', { headers }),
        axios.get('/api/admin/stats', { headers }),
      ]);
      setPendingBooks(pendingRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data');
      setStats({ totalBooks: 0, pendingCount: 0, totalUsers: 0, totalRevenue: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookId) => {
    setActionLoading(bookId);
    try {
      await axios.post(`/api/admin/approve/${bookId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPendingBooks(prev => prev.filter(b => b.id !== bookId));
      fetchData();
    } catch (error) {
      console.error('Failed to approve book');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookId) => {
    setActionLoading(bookId);
    try {
      await axios.post(`/api/admin/reject/${bookId}`, { reason: rejectReason }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPendingBooks(prev => prev.filter(b => b.id !== bookId));
      setShowRejectModal(null);
      setRejectReason('');
      fetchData();
    } catch (error) {
      console.error('Failed to reject book');
    } finally {
      setActionLoading(null);
    }
  };

  const statsCards = [
    { icon: BookOpen, label: 'Total Books', value: stats.totalBooks || 0, color: 'bg-blue-500', gradient: '#3b82f6', delay: 0 },
    { icon: AlertCircle, label: 'Pending Review', value: stats.pendingCount || pendingBooks.length, color: 'bg-amber-500', gradient: '#f59e0b', delay: 0.1 },
    { icon: Users, label: 'Total Users', value: stats.totalUsers || 0, color: 'bg-green-500', gradient: '#10b981', delay: 0.2 },
    { icon: DollarSign, label: 'Total Revenue', value: `$${(stats.totalRevenue || 0).toFixed(0)}`, color: 'bg-violet-500', gradient: '#8b5cf6', delay: 0.3 },
  ];

  const tabs = [
    { id: 'pending', label: 'Pending Review', icon: AlertCircle, count: pendingBooks.length },
    { id: 'approved', label: 'Approved Books', icon: ShieldCheck },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-primary mb-1">Admin Dashboard</h1>
            <p className="text-text-light">Manage books, users, and platform settings</p>
          </div>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className="flex items-center gap-2 bg-white text-primary px-4 py-2.5 rounded-xl shadow-soft hover:shadow-medium transition-all font-medium text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-warm overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 font-medium text-sm transition-colors whitespace-nowrap relative ${activeTab === tab.id ? 'text-highlight' : 'text-text-light hover:text-primary'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-highlight text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">{tab.count}</span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-highlight"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* Pending Tab */}
              {activeTab === 'pending' && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {pendingBooks.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-primary mb-2">All caught up!</h3>
                      <p className="text-text-light">No books pending review right now.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-text-light mb-4">{pendingBooks.length} book{pendingBooks.length !== 1 ? 's' : ''} awaiting your review</p>
                      {pendingBooks.map((book) => (
                        <motion.div
                          key={book.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          className="border border-warm rounded-2xl p-6 hover:border-highlight/30 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row gap-5">
                            {/* Cover */}
                            <div
                              className="w-28 h-40 rounded-xl flex-shrink-0 flex items-end p-3 relative overflow-hidden"
                              style={{ background: getCoverGradient(book.id) }}
                            >
                              <div className="text-white text-xs font-serif font-bold line-clamp-2 relative z-10">{book.title}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-primary leading-tight">{book.title}</h3>
                                  <p className="text-text-light text-sm">by {book.author}</p>
                                </div>
                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start">
                                  Pending Review
                                </span>
                              </div>
                              <p className="text-sm text-text-light mb-4 line-clamp-2">{book.description}</p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {book.category && <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-medium">{book.category}</span>}
                                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-medium">${book.price}</span>
                                {book.rentalPrice && <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-xs font-medium">Rent ${book.rentalPrice}/day</span>}
                                {book.pages && <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium">{book.pages} pages</span>}
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleApprove(book.id)}
                                  disabled={actionLoading === book.id}
                                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm font-medium"
                                >
                                  {actionLoading === book.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                  Approve
                                </button>
                                <button
                                  onClick={() => setShowRejectModal(book.id)}
                                  disabled={actionLoading === book.id}
                                  className="flex items-center gap-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm font-medium border border-red-200 hover:border-red-500"
                                >
                                  <X className="w-4 h-4" /> Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Approved Tab */}
              {activeTab === 'approved' && (
                <motion.div key="approved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookMarked className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Approved Books</h3>
                    <p className="text-text-light">All currently live books will appear here.</p>
                  </div>
                </motion.div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-primary mb-2">User Management</h3>
                    <p className="text-text-light">View and manage registered users.</p>
                  </div>
                </motion.div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Revenue chart placeholder */}
                    <div className="bg-warm rounded-2xl p-6">
                      <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-highlight" /> Revenue Overview
                      </h3>
                      <div className="flex items-end gap-2 h-32">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-highlight to-highlight/40 rounded-t-lg"
                            style={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.08, duration: 0.6, ease: 'easeOut' }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-text-light">
                        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
                      </div>
                    </div>
                    {/* Top categories */}
                    <div className="bg-warm rounded-2xl p-6">
                      <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" /> Top Categories
                      </h3>
                      {[
                        { name: 'Technology', pct: 35, color: 'bg-blue-500' },
                        { name: 'Self-Help', pct: 25, color: 'bg-green-500' },
                        { name: 'Business', pct: 20, color: 'bg-purple-500' },
                        { name: 'Finance', pct: 12, color: 'bg-amber-500' },
                        { name: 'Others', pct: 8, color: 'bg-gray-400' },
                      ].map(cat => (
                        <div key={cat.name} className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-primary font-medium">{cat.name}</span>
                            <span className="text-text-light">{cat.pct}%</span>
                          </div>
                          <div className="h-2 bg-white rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${cat.color} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${cat.pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-medium"
            >
              <h3 className="text-xl font-semibold text-primary mb-2">Reject Book</h3>
              <p className="text-text-light text-sm mb-4">Please provide a reason so the publisher can improve their submission.</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight h-32 resize-none mb-5 text-sm"
                placeholder="e.g. Low quality content, inappropriate material, missing metadata..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                  className="flex-1 border-2 border-warm py-3 rounded-xl hover:border-primary transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  disabled={!rejectReason.trim() || actionLoading}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
