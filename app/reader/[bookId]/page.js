'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark as BookmarkIcon, Settings, ZoomIn, ZoomOut, Maximize2, Minimize2, List, Loader2, Moon, Sun, X, ShieldAlert, RotateCw } from 'lucide-react';

const CDN_PDF = 'https://unpkg.com/pdfjs-dist@5.6.205/build/pdf.min.mjs';
const CDN_WORKER = 'https://unpkg.com/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs';

const THEMES = [
  { id: 'day', bg: '#FAF6EE', text: '#2C1810', canvasBg: '#FFFCF5', icon: Sun, label: 'Day' },
  { id: 'sepia', bg: '#F5EBD9', text: '#5B4636', canvasBg: '#F3E8D2', icon: Sun, label: 'Sepia' },
  { id: 'night', bg: '#1A1410', text: '#E5D9C5', canvasBg: '#1E1814', icon: Moon, label: 'Night' }
];

function ReaderInner() {
  const { bookId } = useParams();
  const router = useRouter();
  const canvasRef = useRef(null);
  const pdfDoc = useRef(null);
  const renderTask = useRef(null);
  const [status, setStatus] = useState('book');
  const [error, setError] = useState('');
  const [book, setBook] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [themeIdx, setThemeIdx] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showBmList, setShowBmList] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [nightAmt, setNightAmt] = useState(20);

  const th = THEMES[themeIdx];
  const tc = th.text;
  const tb = th.bg;

  useEffect(() => {
    const b = localStorage.getItem(`bm_${bookId}`);
    if (b) try { setBookmarks(JSON.parse(b)); } catch {}
    const n = localStorage.getItem('gp_n');
    if (n === '1') setNightMode(true);
    const a = localStorage.getItem('gp_a');
    if (a) setNightAmt(parseInt(a, 10));
  }, [bookId]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/books/${bookId}`);
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Not found');
        setBook(d.book);
      } catch (e) {
        setError(e.message);
        setStatus('error');
      }
    })();
  }, [bookId]);

  useEffect(() => {
    if (!book) return;
    let dead = false;
    (async () => {
      try {
        setStatus('loading');
        const pdfjs = await import(/* webpackIgnore: true */ CDN_PDF);
        pdfjs.GlobalWorkerOptions.workerSrc = CDN_WORKER;
        const doc = await pdfjs.getDocument(`/api/books/${bookId}/pdf`).promise;
        if (dead) return;
        pdfDoc.current = doc;
        setTotalPages(doc.numPages);
        setPage(1);
        setStatus('ready');
      } catch (e) {
        if (!dead) { setError(e.message); setStatus('error'); }
      }
    })();
    return () => { dead = true; };
  }, [book, bookId]);

  const draw = useCallback(async (n) => {
    if (!pdfDoc.current || !canvasRef.current) return;
    if (renderTask.current) try { renderTask.current.cancel(); } catch {}
    try {
      const pg = await pdfDoc.current.getPage(n);
      const box = canvasRef.current.parentElement;
      const mw = (box?.clientWidth || 700) - 8;
      const mh = (box?.clientHeight || 500) - 8;
      const v1 = pg.getViewport({ scale: 1 });
      const f = Math.min(mw / v1.width, mh / v1.height, scale || 1.2);
      const s = Math.max(0.5, Math.min(f, 2.5));
      const vp = pg.getViewport({ scale: s });
      const c = canvasRef.current;
      const ctx = c.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = vp.width * dpr;
      c.height = vp.height * dpr;
      c.style.width = vp.width + 'px';
      c.style.height = vp.height + 'px';
      ctx.scale(dpr, dpr);
      ctx.fillStyle = th.canvasBg;
      ctx.fillRect(0, 0, vp.width, vp.height);
      renderTask.current = pg.render({ canvasContext: ctx, viewport: vp });
      await renderTask.current.promise;
    } catch (e) {
      if (e?.name !== 'RenderingCancelledException') console.error(e);
    }
  }, [scale, th.canvasBg]);

  useEffect(() => { if (pdfDoc.current) draw(page); }, [page, draw]);
  useEffect(() => { const h = () => draw(page); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, [page, draw]);

  useEffect(() => {
    const h = (e) => {
      if (e.target?.tagName === 'INPUT') return;
      if (['ArrowRight', ' ', 'ArrowDown'].includes(e.key)) { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }
      if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }
      if (e.key === 'Home') setPage(1);
      if (e.key === 'End') setPage(totalPages);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [totalPages]);

  useEffect(() => {
    const no = (e) => { if (['contextmenu', 'copy', 'dragstart'].includes(e.type)) e.preventDefault(); };
    window.addEventListener('contextmenu', no);
    window.addEventListener('copy', no);
    window.addEventListener('dragstart', no);
    const kd = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(e.key.toLowerCase())) e.preventDefault();
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.shiftKey && e.key === 'S')) {
        const el = document.getElementById('gp-blk');
        if (el) { el.style.opacity = '1'; setTimeout(() => el.style.opacity = '0', 800); }
      }
    };
    const vis = () => { if (document.hidden) { const el = document.getElementById('gp-blk'); if (el) { el.style.opacity = '1'; setTimeout(() => el.style.opacity = '0', 800); } } };
    window.addEventListener('keydown', kd);
    document.addEventListener('visibilitychange', vis);
    return () => {
      window.removeEventListener('contextmenu', no);
      window.removeEventListener('copy', no);
      window.removeEventListener('dragstart', no);
      window.removeEventListener('keydown', kd);
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);

  const next = () => setPage(p => Math.min(totalPages, p + 1));
  const prev = () => setPage(p => Math.max(1, p - 1));
  const clickPg = (e) => { const r = e.currentTarget.getBoundingClientRect(); const x = e.clientX - r.left; if (x < r.width * 0.35) prev(); else if (x > r.width * 0.65) next(); };
  let tx = null;
  const ts = (e) => { tx = e.touches[0].clientX; };
  const te = (e) => { if (tx !== null) { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) dx < 0 ? next() : prev(); tx = null; } };
  const toggleBm = () => { setBookmarks(p => { const n = p.includes(page) ? p.filter(x => x !== page) : [...p, page].sort(); localStorage.setItem(`bm_${bookId}`, JSON.stringify(n)); return n; }); };

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: tb }}>
        <div className="bg-cream border border-warm/60 rounded-2xl p-8 shadow-medium max-w-md text-center">
          <h2 className="font-serif text-xl font-bold mb-2">Could not load book</h2>
          <p className="text-sm text-text-light mb-4">{error || 'Unknown error'}</p>
          <button onClick={() => router.refresh()} className="px-5 py-2.5 bg-primary text-cream rounded-lg text-sm font-medium inline-flex items-center gap-2">
            <RotateCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (status !== 'ready') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: tb }}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: tc }} />
          <p className="text-sm opacity-60" style={{ color: tc }}>
            {status === 'loading' ? 'Loading pages…' : 'Loading book…'}
          </p>
        </div>
      </div>
    );
  }

  const bm = bookmarks.includes(page);
  const nc = nightMode ? `rgba(255,160,50,${nightAmt / 100 * 0.13})` : 'transparent';

  return (
    <div style={{ background: tb, minHeight: '100vh', color: tc, position: 'relative' }}>
      <style>{`
        @media print { body * { display: none !important; } }
        canvas { user-select: none !important; -webkit-user-select: none !important; pointer-events: none !important; }
        .nl { position: fixed; inset: 0; pointer-events: none; z-index: 40; mix-blend-mode: soft-light; }
        #gp-blk { position: fixed; inset: 0; z-index: 9999; background: #000; opacity: 0; transition: opacity .25s; pointer-events: none; }
      `}</style>

      <div id="gp-blk" />
      {nightMode && <div className="nl" style={{ background: nc }} />}

      <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-5 py-2 border-b backdrop-blur-sm"
        style={{ background: tb + 'ee', borderColor: tc + '18' }}>
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/library" className="p-1.5 rounded hover:bg-black/5"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="min-w-0">
            <p className="text-sm font-serif font-semibold truncate">{book?.title || ''}</p>
            <p className="text-xs opacity-50">Page {page}{totalPages ? ` of ${totalPages}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setShowBmList(true)} className="p-2 rounded hover:bg-black/5 relative" title="Bookmarks">
            <List className="w-4.5 h-4.5" />
            {bookmarks.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-primary text-cream text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{bookmarks.length}</span>}
          </button>
          <button onClick={toggleBm} className="p-2 rounded hover:bg-black/5" title={bm ? 'Remove bookmark' : 'Add bookmark'}>
            <BookmarkIcon className="w-4.5 h-4.5" fill={bm ? tc : 'none'} />
          </button>
          <button onClick={() => setShowPanel(o => !o)} className="p-2 rounded hover:bg-black/5" title="Settings">
            <Settings className="w-4.5 h-4.5" />
          </button>
          <button onClick={() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }} className="p-2 rounded hover:bg-black/5" title="Fullscreen">
            {document.fullscreenElement ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
          </button>
        </div>
      </header>

      <div className="flex items-center justify-center px-2 py-4 select-none"
        style={{ minHeight: 'calc(100vh - 100px)' }}
        onClick={clickPg} onTouchStart={ts} onTouchEnd={te}>
        <button onClick={e => { e.stopPropagation(); prev(); }} disabled={page <= 1}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-cream/70 shadow disabled:opacity-15 z-10">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="bg-white shadow-card rounded-lg overflow-hidden relative" style={{ maxWidth: '92vw' }}>
          <canvas ref={canvasRef} className="block mx-auto" />
        </div>
        <button onClick={e => { e.stopPropagation(); next(); }} disabled={page >= totalPages}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-cream/70 shadow disabled:opacity-15 z-10">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 pb-4 max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <button onClick={prev} disabled={page <= 1} className="p-1 rounded hover:bg-black/5 disabled:opacity-25"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <span className="text-xs font-mono opacity-60 w-6 text-center">{page}</span>
          <input type="range" min={1} max={totalPages || 1} value={page} onChange={e => setPage(parseInt(e.target.value, 10))} className="flex-1 accent-primary" style={{ accentColor: '#C4623F' }} />
          <span className="text-xs font-mono opacity-60 w-6 text-center">{totalPages}</span>
          <button onClick={next} disabled={page >= totalPages} className="p-1 rounded hover:bg-black/5 disabled:opacity-25"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
        <p className="text-center text-[10px] opacity-30 mt-2 flex items-center justify-center gap-1">
          <ShieldAlert className="w-3 h-3" /> Protected — screenshots, print & copy blocked
        </p>
      </div>

      {showPanel && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-cream border-t border-warm rounded-t-2xl p-5 shadow-medium max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-semibold">Settings</h3>
            <button onClick={() => setShowPanel(false)} className="p-1 rounded hover:bg-warm"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-light mb-2">Theme</p>
              <div className="flex gap-2">
                {THEMES.map((t, i) => (
                  <button key={t.id} onClick={() => setThemeIdx(i)}
                    className={`flex-1 p-2.5 rounded-lg border-2 text-xs font-medium ${themeIdx === i ? 'border-primary' : 'border-warm'}`}
                    style={{ background: t.bg, color: t.text }}>
                    <t.icon className="w-4 h-4 mx-auto mb-1" />{t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-light mb-2 flex items-center gap-1">
                <Moon className="w-3 h-3" /> Night light
              </p>
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => { const n = !nightMode; setNightMode(n); localStorage.setItem('gp_n', n ? '1' : '0'); }} className={`relative w-10 h-5 rounded-full ${nightMode ? 'bg-primary' : 'bg-warm'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-cream shadow transition-transform ${nightMode ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-sm text-text-light">{nightMode ? 'On' : 'Off'}</span>
              </div>
              {nightMode && <input type="range" min={5} max={70} value={nightAmt} onChange={e => { const v = parseInt(e.target.value); setNightAmt(v); localStorage.setItem('gp_a', v); }} className="w-full" />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-light mb-2">Zoom</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setScale(s => +Math.max(0.6, s - 0.2).toFixed(1))} className="p-2 rounded-lg bg-warm"><ZoomOut className="w-4 h-4" /></button>
                <span className="font-mono text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => +Math.min(2.5, s + 0.2).toFixed(1))} className="p-2 rounded-lg bg-warm"><ZoomIn className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBmList && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-end sm:items-center justify-center p-4" onClick={() => setShowBmList(false)}>
          <div className="bg-cream rounded-2xl shadow-medium w-full max-w-sm max-h-[60vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-warm flex items-center justify-between">
              <h3 className="font-serif font-semibold">Bookmarks</h3>
              <button onClick={() => setShowBmList(false)} className="p-1 rounded hover:bg-warm"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto p-3">
              {bookmarks.length === 0 ? <p className="text-center text-text-light text-sm py-6">No bookmarks yet.</p> : bookmarks.map(p => (
                <button key={p} onClick={() => { setPage(p); setShowBmList(false); }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-warm flex items-center gap-3 text-sm">
                  <BookmarkIcon className="w-4 h-4 text-primary" fill="currentColor" />
                  Page {p} {p === page && <span className="ml-auto text-[11px] text-primary">Current</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReaderPage() {
  return <ProtectedRoute><ReaderInner /></ProtectedRoute>;
}
