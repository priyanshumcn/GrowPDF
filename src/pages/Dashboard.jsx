import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Upload, DollarSign, Eye, TrendingUp, 
  Plus, FileText, Settings, LogOut, Image as ImageIcon,
  X, Check, AlertCircle, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const UploadZone = ({ label, accept, onFileSelect, file, onRemove, icon: Icon, maxSize, hint }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
    e.target.value = '';
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && (!accept || f.type.match(accept.replace('*', '').split(',')[0]?.trim()?.replace(/\*/g, '') || '.'))) {
      onFileSelect(f);
    }
  }, [accept, onFileSelect]);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-primary mb-2">{label} *</label>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group
          ${dragOver ? 'border-highlight bg-highlight/5 scale-[1.02]' : 'border-warm hover:border-highlight hover:bg-highlight/5'}
          ${file ? 'border-green-400 bg-green-50/50' : ''}`}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />

        {file ? (
          <div className="flex items-center gap-4 justify-center">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Check className="w-7 h-7 text-green-500" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-medium text-primary truncate">{file.name}</p>
              <p className="text-sm text-text-light">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-2 hover:bg-red-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-red-400 hover:text-red-600" />
            </button>
          </div>
        ) : (
          <>
            <Icon className={`w-12 h-12 mx-auto mb-3 transition-colors ${dragOver ? 'text-highlight' : 'text-text-light/30'}`} />
            <p className={`font-medium mb-1 transition-colors ${dragOver ? 'text-highlight' : 'text-text-light'}`}>
              {dragOver ? 'Drop file here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-text-light/60">{hint || accept}</p>
            {maxSize && <p className="text-xs text-text-light/40 mt-1">Max size: {maxSize}</p>}
          </>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '', author: '', description: '', category: '',
    price: '', rentalPrice: '', pages: '', language: 'English',
    publisher: '', seoTitle: '', seoDescription: '', tags: ''
  });

  const handleFieldChange = (e) => {
    setUploadForm({ ...uploadForm, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!pdfFile) {
      setMessage({ type: 'error', text: 'Please select a PDF file to upload' });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(uploadForm).forEach(([key, val]) => formData.append(key, val));
      if (pdfFile) formData.append('pdf', pdfFile);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      await axios.post('/api/books/upload', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Book submitted for review! Admin will approve it soon.' });
      setUploadForm({
        title: '', author: '', description: '', category: '',
        price: '', rentalPrice: '', pages: '', language: 'English',
        publisher: '', seoTitle: '', seoDescription: '', tags: ''
      });
      setPdfFile(null);
      setThumbnailFile(null);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Upload failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: BookOpen, label: 'Books Published', value: '0', color: 'bg-blue-500' },
    { icon: DollarSign, label: 'Total Earnings', value: '$0', color: 'bg-green-500' },
    { icon: Eye, label: 'Total Views', value: '0', color: 'bg-purple-500' },
    { icon: TrendingUp, label: 'Pending Review', value: '0', color: 'bg-yellow-500' }
  ];

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-primary mb-2">Publisher Dashboard</h1>
            <p className="text-text-light">Manage your books and track performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin" className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-highlight transition-colors text-sm">
              Admin Panel
            </Link>
            <button onClick={logout} className="p-2 hover:bg-warm rounded-xl transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-soft"
            >
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-text-light">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="flex border-b border-warm overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'upload', label: 'Upload Book', icon: Upload },
              { id: 'mybooks', label: 'My Books', icon: BookOpen },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-highlight border-b-2 border-highlight' : 'text-text-light hover:text-primary'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Welcome */}
                <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
                  <h3 className="text-2xl font-serif font-bold mb-2">Welcome back, {user?.name}! 👋</h3>
                  <p className="text-gray-300 mb-6">Here's a snapshot of your publishing activity.</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="bg-highlight text-white px-6 py-3 rounded-xl hover:bg-white hover:text-primary transition-all inline-flex items-center gap-2 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Upload New Book
                  </button>
                </div>
                {/* Quick tips */}
                <div>
                  <h4 className="font-semibold text-primary mb-4">Getting Started</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { step: '1', title: 'Upload a PDF', desc: 'Share your book as a PDF file.', icon: FileText, tab: 'upload' },
                      { step: '2', title: 'Wait for Review', desc: 'Our team will review within 24–48h.', icon: Check, tab: null },
                      { step: '3', title: 'Earn Revenue', desc: 'Get paid when readers buy or rent.', icon: DollarSign, tab: null },
                    ].map(item => (
                      <div
                        key={item.step}
                        className="bg-warm rounded-2xl p-5 cursor-pointer hover:shadow-soft transition-shadow"
                        onClick={() => item.tab && setActiveTab(item.tab)}
                      >
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">{item.step}</div>
                        <h5 className="font-medium text-primary mb-1">{item.title}</h5>
                        <p className="text-text-light text-xs">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <form onSubmit={handleUpload} className="max-w-2xl mx-auto space-y-6">
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-3 px-5 py-4 rounded-xl ${
                      message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-600'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <Check className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="text-sm">{message.text}</span>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Book Title *</label>
                    <input
                      type="text" name="title" value={uploadForm.title} onChange={handleFieldChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Author *</label>
                    <input
                      type="text" name="author" value={uploadForm.author} onChange={handleFieldChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Description *</label>
                  <textarea
                    name="description" value={uploadForm.description} onChange={handleFieldChange}
                    className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors h-32 resize-none"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Category *</label>
                    <select
                      name="category" value={uploadForm.category} onChange={handleFieldChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Technology">Technology</option>
                      <option value="Self-Help">Self-Help</option>
                      <option value="Business">Business</option>
                      <option value="Finance">Finance</option>
                      <option value="Art & Design">Art & Design</option>
                      <option value="Philosophy">Philosophy</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Price ($) *</label>
                    <input
                      type="number" step="0.01" min="0" name="price" value={uploadForm.price} onChange={handleFieldChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Rental ($/day) *</label>
                    <input
                      type="number" step="0.01" min="0" name="rentalPrice" value={uploadForm.rentalPrice} onChange={handleFieldChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Pages</label>
                    <input
                      type="number" min="1" name="pages" value={uploadForm.pages} onChange={handleFieldChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Publisher</label>
                    <input
                      type="text" name="publisher" value={uploadForm.publisher} onChange={handleFieldChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Language</label>
                    <input
                      type="text" name="language" value={uploadForm.language} onChange={handleFieldChange}
                      className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors"
                    />
                  </div>
                </div>

                <UploadZone
                  label="PDF File"
                  accept=".pdf,application/pdf"
                  onFileSelect={(f) => setPdfFile(f)}
                  file={pdfFile}
                  onRemove={() => setPdfFile(null)}
                  icon={FileText}
                  hint="PDF files only"
                  maxSize="50 MB"
                />

                <UploadZone
                  label="Book Cover Thumbnail"
                  accept="image/*"
                  onFileSelect={(f) => setThumbnailFile(f)}
                  file={thumbnailFile}
                  onRemove={() => setThumbnailFile(null)}
                  icon={ImageIcon}
                  hint="JPG, PNG, WebP"
                  maxSize="5 MB"
                />

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">SEO Title</label>
                  <input
                    type="text" name="seoTitle" value={uploadForm.seoTitle} onChange={handleFieldChange}
                    className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors"
                    placeholder="Optimized title for search engines"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">SEO Description</label>
                  <textarea
                    name="seoDescription" value={uploadForm.seoDescription} onChange={handleFieldChange}
                    className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors h-20 resize-none"
                    placeholder="Brief description for search engines (max 160 chars)"
                    maxLength={160}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Tags (comma separated)</label>
                  <input
                    type="text" name="tags" value={uploadForm.tags} onChange={handleFieldChange}
                    className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors"
                    placeholder="e.g. technology, programming, python"
                  />
                </div>

                <div className="bg-warm rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                    <div className="text-sm text-text-light">
                      <p className="font-medium text-primary mb-1">Review Process</p>
                      <p>Your book will be reviewed by our admin team before being published. This usually takes 24-48 hours. You will be notified once it's approved.</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !pdfFile}
                  className="w-full bg-primary text-white py-4 rounded-xl hover:bg-highlight transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Submit for Review
                    </>
                  )}
                </button>
              </form>
            )}

            {activeTab === 'mybooks' && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-text-light/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">No books yet</h3>
                <p className="text-text-light">Upload your first book to get started</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl">
                <h3 className="text-xl font-semibold text-primary mb-6">Account Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Name</label>
                    <input
                      type="text" defaultValue={user?.name}
                      className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Email</label>
                    <input
                      type="email" defaultValue={user?.email} disabled
                      className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors opacity-60"
                    />
                  </div>
                  {user?.role === 'publisher' && (
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">UPI ID</label>
                      <input
                        type="text" defaultValue={user?.upiId}
                        className="w-full bg-warm border-2 border-transparent rounded-xl px-4 py-3 focus:outline-none focus:border-highlight transition-colors"
                        placeholder="yourname@upi"
                      />
                      <p className="text-xs text-text-light mt-1">Required for receiving payments from book sales</p>
                    </div>
                  )}
                  <button className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-highlight transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
