const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { books, pendingBooks, persist } = require('../models/database');
const { verifyToken } = require('../utils/auth');

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');
const THUMBNAILS_DIR = path.join(__dirname, '../../public/thumbnails');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(THUMBNAILS_DIR)) fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, file.fieldname === 'thumbnail' ? THUMBNAILS_DIR : UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnail' && !file.mimetype.startsWith('image/')) {
    return cb(new Error('Thumbnail must be an image file'), false);
  }
  if (file.fieldname === 'pdf' && file.mimetype !== 'application/pdf') {
    return cb(new Error('File must be a PDF'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

const uploadMiddleware = upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

function handleUpload(req, res, next) {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err.message);
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large. PDF max 50MB, images max 5MB.' });
        return res.status(400).json({ error: err.message || 'File upload error' });
      }
      next();
    });
  } else {
    next();
  }
}

router.post('/upload', handleUpload, (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (decoded.role !== 'publisher' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Only publishers can upload books' });
    }

    const { title, author, description, category, price, rentalPrice, pages, language, publisher, seoTitle, seoDescription, tags } = req.body;

    if (!title || !author || !description || !category || !price || !rentalPrice) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    if (!req.files?.pdf) {
      return res.status(400).json({ error: 'Please select a PDF file to upload' });
    }

    const pdfFileName = req.files.pdf[0].filename;
    const thumbnailFileName = req.files.thumbnail?.[0]?.filename || null;

    const newBook = {
      id: Date.now().toString(),
      title: title.trim(), author: author.trim(), description: description.trim(), category,
      price: parseFloat(price), rentalPrice: parseFloat(rentalPrice),
      thumbnail: thumbnailFileName, pdfUrl: pdfFileName,
      pages: parseInt(pages) || 0, language: language || 'English', publisher: publisher || 'Independent',
      publishedDate: new Date().toISOString().split('T')[0],
      isbn: `978-${Date.now().toString().slice(-10)}`,
      rating: 0, reviews: 0, sales: 0, status: 'pending',
      createdAt: new Date().toISOString(),
      seoTitle: seoTitle || title, seoDescription: seoDescription || description.substring(0, 160),
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      submittedBy: decoded.id
    };

    pendingBooks.push(newBook);
    persist();

    res.status(201).json({
      message: 'Book submitted for review! Admin will review it shortly.',
      book: { ...newBook, thumbnail: thumbnailFileName ? `/thumbnails/${thumbnailFileName}` : null, pdfUrl: `/uploads/${pdfFileName}` }
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to submit book' });
  }
});

router.get('/', (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    let filtered = books.filter(b => b.status === 'approved');

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(b => (b.title||'').toLowerCase().includes(s) || (b.author||'').toLowerCase().includes(s) || (b.description||'').toLowerCase().includes(s));
    }
    if (category && category !== 'all') filtered = filtered.filter(b => b.category === category);
    if (sort === 'price-low') filtered.sort((a,b) => a.price - b.price);
    else if (sort === 'price-high') filtered.sort((a,b) => b.price - a.price);
    else if (sort === 'newest') filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === 'popular') filtered.sort((a,b) => (b.sales||0) - (a.sales||0));

    const start = (page - 1) * limit;
    res.json({ books: filtered.slice(start, start + parseInt(limit)).map(b => ({...b, thumbnail: b.thumbnail ? `/thumbnails/${b.thumbnail}` : null, pdfUrl: b.pdfUrl ? `/uploads/${b.pdfUrl}` : null})), total: filtered.length, page: parseInt(page), totalPages: Math.ceil(filtered.length / limit) });
  } catch (error) {
    console.error('Books fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

router.get('/categories', (req, res) => {
  try { res.json([...new Set(books.filter(b => b.status === 'approved').map(b => b.category))]); }
  catch (error) { res.status(500).json({ error: 'Failed to fetch categories' }); }
});

router.get('/featured', (req, res) => {
  try { res.json(books.filter(b => b.status === 'approved').slice(0, 8).map(b => ({...b, thumbnail: b.thumbnail ? `/thumbnails/${b.thumbnail}` : null, pdfUrl: b.pdfUrl ? `/uploads/${b.pdfUrl}` : null}))); }
  catch (error) { res.status(500).json({ error: 'Failed to fetch featured books' }); }
});

router.get('/new-releases', (req, res) => {
  try { res.json(books.filter(b => b.status === 'approved').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8).map(b => ({...b, thumbnail: b.thumbnail ? `/thumbnails/${b.thumbnail}` : null, pdfUrl: b.pdfUrl ? `/uploads/${b.pdfUrl}` : null}))); }
  catch (error) { res.status(500).json({ error: 'Failed to fetch new releases' }); }
});

router.get('/bestsellers', (req, res) => {
  try { res.json(books.filter(b => b.status === 'approved').sort((a,b) => (b.sales||0) - (a.sales||0)).slice(0, 8).map(b => ({...b, thumbnail: b.thumbnail ? `/thumbnails/${b.thumbnail}` : null, pdfUrl: b.pdfUrl ? `/uploads/${b.pdfUrl}` : null}))); }
  catch (error) { res.status(500).json({ error: 'Failed to fetch bestsellers' }); }
});

router.get('/:id', (req, res) => {
  try {
    const book = books.find(b => b.id === req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({...book, thumbnail: book.thumbnail ? `/thumbnails/${book.thumbnail}` : null, pdfUrl: book.pdfUrl ? `/uploads/${book.pdfUrl}` : null});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});


// Secure PDF serving — requires valid JWT + book ownership
router.get('/:id/pdf', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Find book
    const allBooks = [...books, ...pendingBooks];
    const book = allBooks.find(b => b.id === req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    // Check the user has access (bought or rented)
    const { users } = require('../models/database');
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const isAdmin = decoded.role === 'admin' || decoded.role === 'publisher';
    const libEntry = (user.library || []).find(l => l.bookId === req.params.id);
    const isSubmitter = book.submittedBy === decoded.id;

    if (!isAdmin && !libEntry && !isSubmitter) {
      return res.status(403).json({ error: 'You do not have access to this book' });
    }

    // Check rental expiry
    if (libEntry && libEntry.accessType === 'rent' && libEntry.expiresAt) {
      if (new Date(libEntry.expiresAt) < new Date()) {
        return res.status(403).json({ error: 'Your rental has expired' });
      }
    }

    if (!book.pdfUrl) return res.status(404).json({ error: 'PDF not available' });

    const pdfPath = path.join(__dirname, '../../public/uploads/', book.pdfUrl);
    if (!fs.existsSync(pdfPath)) return res.status(404).json({ error: 'PDF file not found on server' });

    const stat = fs.statSync(pdfPath);
    
    // Set headers to prevent caching/download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);
  } catch (error) {
    console.error('PDF serve error:', error.message);
    res.status(500).json({ error: 'Failed to serve PDF' });
  }
});

module.exports = router;
