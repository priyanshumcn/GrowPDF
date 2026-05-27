import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Settings, X, Maximize, Minimize,
  Bookmark, Shield, Loader2, AlertCircle, ZoomIn, ZoomOut
} from 'lucide-react';
import axios from 'axios';

// ─── Print block CSS ───────────────────────────────────────────────────────
const PRINT_CSS = `@media print{body *{visibility:hidden!important}body::after{content:"Printing disabled.";visibility:visible!important;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:24px}}`;

const THEMES = {
  light: { bg: '#ffffff', paper: '#fafafa', text: '#1a1a2e', toolbar: 'rgba(255,255,255,0.96)' },
  dark:  { bg: '#111111', paper: '#1a1a2e', text: '#f0ebe0', toolbar: 'rgba(17,17,17,0.96)' },
  sepia: { bg: '#f5f0e8', paper: '#ede8e0', text: '#4a3728', toolbar: 'rgba(245,240,232,0.96)' },
};

const Reader = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTaskRef = useRef(null);
  const toolbarTimer = useRef(null);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfReady, setPdfReady] = useState(false);
  const [rendering, setRendering] = useState(false);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.4);
  const [theme, setTheme] = useState('light');
  const [showToolbar, setShowToolbar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [screenBlocked, setScreenBlocked] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`bm_${bookId}`) || '[]'); } catch { return []; }
  });

  const T = THEMES[theme];

  // ── Load book + PDF using pdfjs-dist directly ──────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setError('Please sign in to read this book.'); setLoading(false); return; }
        const headers = { Authorization: `Bearer ${token}` };

        // Load book metadata
        const { data: bookData } = await axios.get(`/api/books/${bookId}`, { headers });
        if (!cancelled) setBook(bookData);

        // Fetch PDF as ArrayBuffer via authenticated route
        const pdfRes = await axios.get(`/api/books/${bookId}/pdf`, {
          headers,
          responseType: 'arraybuffer',
        });

        if (cancelled) return;

        // Dynamically import pdfjs-dist — uses whatever version is in node_modules
        // Worker is set to the SAME package so versions always match
        const pdfjsLib = await import('pdfjs-dist');

        // Point worker to the exact same installed version — same import = same version
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();

        const loadingTask = pdfjsLib.getDocument({ data: pdfRes.data });
        const pdf = await loadingTask.promise;

        if (cancelled) return;

        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setPdfReady(true);
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 403) setError('Purchase this book to read it.');
        else if (status === 401) setError('Please sign in to read this book.');
        else setError(err.response?.data?.error || err.message || 'Failed to load book.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [bookId]);

  // ── Render page onto canvas ────────────────────────────────────────────
  const renderPage = useCallback(async (pageNum, scaleVal) => {
    if (!pdfDocRef.current || !canvasRef.current) return;

    // Cancel any in-progress render
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch {}
    }

    setRendering(true);
    try {
      const page = await pdfDocRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale: scaleVal });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width  = viewport.width;
      canvas.height = viewport.height;

      const task = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;
    } catch (e) {
      if (e?.name !== 'RenderingCancelledException') console.error(e);
    } finally {
      setRendering(false);
    }
  }, []);

  useEffect(() => {
    if (pdfReady) renderPage(currentPage, scale);
  }, [pdfReady, currentPage, scale, renderPage]);

  // ── Print block ────────────────────────────────────────────────────────
  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = PRINT_CSS;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  // ── DRM ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const block = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s','p','u','a'].includes(e.key.toLowerCase())) { e.preventDefault(); return false; }
      if (e.metaKey && e.shiftKey && ['3','4','5'].includes(e.key)) { e.preventDefault(); try { navigator.clipboard.writeText(''); } catch {} setScreenBlocked(true); setTimeout(() => setScreenBlocked(false), 2500); return false; }
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') { e.preventDefault(); try { navigator.clipboard.writeText(''); } catch {} setScreenBlocked(true); setTimeout(() => setScreenBlocked(false), 2500); return false; }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase()))) { e.preventDefault(); return false; }
    };
    const hide = () => setScreenBlocked(true);
    const show = () => setTimeout(() => setScreenBlocked(false), 600);
    const noCtx = (e) => e.preventDefault();

    document.addEventListener('keydown', block, true);
    document.addEventListener('visibilitychange', () => document.hidden ? hide() : show());
    document.addEventListener('contextmenu', noCtx);
    window.addEventListener('blur', hide);
    window.addEventListener('focus', show);
    return () => {
      document.removeEventListener('keydown', block, true);
      document.removeEventListener('contextmenu', noCtx);
      window.removeEventListener('blur', hide);
      window.removeEventListener('focus', show);
    };
  }, []);

  // ── Toolbar auto-hide ──────────────────────────────────────────────────
  useEffect(() => {
    const reset = () => { setShowToolbar(true); clearTimeout(toolbarTimer.current); toolbarTimer.current = setTimeout(() => setShowToolbar(false), 3500); };
    window.addEventListener('mousemove', reset);
    window.addEventListener('touchstart', reset);
    reset();
    return () => { window.removeEventListener('mousemove', reset); window.removeEventListener('touchstart', reset); clearTimeout(toolbarTimer.current); };
  }, []);

  // ── Keyboard nav ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setCurrentPage(p => Math.min(numPages, p + 1));
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   setCurrentPage(p => Math.max(1, p - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [numPages]);

  // ── Bookmark ───────────────────────────────────────────────────────────
  const toggleBookmark = () => {
    const next = bookmarks.includes(currentPage)
      ? bookmarks.filter(b => b !== currentPage)
      : [...bookmarks, currentPage].sort((a, b) => a - b);
    setBookmarks(next);
    localStorage.setItem(`bm_${bookId}`, JSON.stringify(next));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen?.(); setIsFullscreen(true); }
    else { document.exitFullscreen?.(); setIsFullscreen(false); }
  };

  // ── States ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#111' }}>
      <Loader2 className="w-10 h-10 text-white/30 animate-spin" />
      <p className="text-white/40 text-sm">Loading your book…</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <div>
        <h2 className="text-xl font-serif font-bold text-primary mb-2">Cannot open book</h2>
        <p className="text-text-light text-sm max-w-sm">{error}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="text-sm text-text-light border border-warm hover:border-primary hover:text-primary px-4 py-2 rounded-xl transition-colors">Go Back</button>
        <button onClick={() => navigate(`/books/${bookId}`)} className="text-sm bg-primary text-white px-4 py-2 rounded-xl hover:bg-highlight transition-colors">View Book Details</button>
      </div>
    </div>
  );

  const isBookmarked = bookmarks.includes(currentPage);

  // ── UI ─────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen relative overflow-x-hidden select-none" style={{ backgroundColor: T.bg, userSelect: 'none', WebkitUserSelect: 'none' }}>

      {/* DRM overlay */}
      {screenBlocked && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center" style={{ backgroundColor: '#000' }} aria-hidden="true">
          <Shield className="w-8 h-8 text-white/20 mb-2" />
          <p className="text-white/25 text-xs tracking-widest uppercase">Protected</p>
        </div>
      )}

      {/* Top toolbar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 transition-all duration-300"
        style={{ backgroundColor: T.toolbar, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${theme==='dark'?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}`, opacity: showToolbar?1:0, transform: showToolbar?'translateY(0)':'translateY(-100%)', pointerEvents: showToolbar?'auto':'none' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:opacity-60 transition-opacity" style={{ color: T.text }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight" style={{ color: T.text }}>{book?.title}</p>
            <p className="text-xs opacity-40" style={{ color: T.text }}>{book?.author}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setScale(s => Math.max(0.6, +(s - 0.2).toFixed(1)))} className="p-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity" style={{ color: T.text }}><ZoomOut className="w-4 h-4" /></button>
          <span className="text-xs px-1 tabular-nums opacity-40 w-10 text-center" style={{ color: T.text }}>{Math.round(scale*100)}%</span>
          <button onClick={() => setScale(s => Math.min(3.0, +(s + 0.2).toFixed(1)))} className="p-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity" style={{ color: T.text }}><ZoomIn className="w-4 h-4" /></button>
          <button onClick={toggleBookmark} className="p-2 rounded-lg transition-colors" style={{ color: isBookmarked ? '#e94560' : T.text, opacity: isBookmarked ? 1 : 0.5 }}>
            <Bookmark className="w-4 h-4" fill={isBookmarked ? '#e94560' : 'none'} />
          </button>
          <button onClick={() => setShowSettings(s => !s)} className="p-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity" style={{ color: T.text }}><Settings className="w-4 h-4" /></button>
          <button onClick={toggleFullscreen} className="hidden md:block p-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity" style={{ color: T.text }}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
            <div className="fixed right-0 top-0 bottom-0 w-64 z-50 shadow-xl overflow-y-auto" style={{ backgroundColor: theme==='dark'?'#16213e':'#ffffff' }}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold" style={{ color: T.text }}>Settings</h3>
                  <button onClick={() => setShowSettings(false)} className="opacity-40 hover:opacity-100 transition-opacity" style={{ color: T.text }}><X className="w-4 h-4" /></button>
                </div>
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-wider opacity-40 mb-2" style={{ color: T.text }}>Theme</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(THEMES).map(([key, t]) => (
                      <button key={key} onClick={() => setTheme(key)}
                        className={`py-2.5 rounded-xl text-xs font-medium border-2 capitalize transition-all ${theme===key?'border-highlight':'border-transparent'}`}
                        style={{ backgroundColor: t.bg, color: t.text }}>
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-wider opacity-40 mb-2" style={{ color: T.text }}>Zoom — {Math.round(scale*100)}%</p>
                  <input type="range" min="60" max="300" step="10" value={Math.round(scale*100)} onChange={e => setScale(parseInt(e.target.value)/100)} className="w-full accent-highlight" />
                </div>
                {bookmarks.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-wider opacity-40 mb-2" style={{ color: T.text }}>Bookmarks</p>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {bookmarks.map(p => (
                        <button key={p} onClick={() => { setCurrentPage(p); setShowSettings(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-highlight hover:text-white transition-colors"
                          style={{ color: T.text, backgroundColor: 'rgba(128,128,128,0.08)' }}>
                          Page {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(128,128,128,0.06)' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Shield className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs font-medium" style={{ color: T.text }}>DRM Protected</span>
                  </div>
                  <ul className="text-xs space-y-0.5 opacity-40" style={{ color: T.text }}>
                    <li>• Download disabled</li>
                    <li>• Screenshot blocked</li>
                    <li>• Printing disabled</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Canvas area */}
      <div className="pt-14 pb-24 flex justify-center items-start min-h-screen">
        <div className="relative my-6">
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <Loader2 className="w-8 h-8 animate-spin opacity-30" style={{ color: T.text }} />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="block shadow-xl"
            style={{ maxWidth: '100%', opacity: rendering ? 0.4 : 1, transition: 'opacity 0.15s' }}
          />
        </div>
      </div>

      {/* Bottom nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 transition-all duration-300"
        style={{ backgroundColor: T.toolbar, backdropFilter: 'blur(20px)', borderTop: `1px solid ${theme==='dark'?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}`, opacity: showToolbar?1:0, transform: showToolbar?'translateY(0)':'translateY(100%)', pointerEvents: showToolbar?'auto':'none' }}
      >
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage<=1} className="p-2 rounded-lg disabled:opacity-20 transition-opacity" style={{ color: T.text }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <input type="range" min={1} max={numPages||1} value={currentPage} onChange={e => setCurrentPage(parseInt(e.target.value))} className="w-full accent-highlight" />
            <div className="flex justify-between text-xs mt-0.5 opacity-40" style={{ color: T.text }}>
              <span>Page {currentPage}</span>
              <span>{numPages} pages</span>
            </div>
          </div>
          <button onClick={() => setCurrentPage(p => Math.min(numPages, p+1))} disabled={currentPage>=numPages} className="p-2 rounded-lg disabled:opacity-20 transition-opacity" style={{ color: T.text }}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reader;
