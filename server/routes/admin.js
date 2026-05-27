const express = require('express');
const router = express.Router();
const { books, pendingBooks, users, persist } = require('../models/database');
const { verifyToken } = require('../utils/auth');

const isAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = users.find(u => u.id === decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/pending', isAdmin, (req, res) => {
  try {
    res.json(pendingBooks);
  } catch (error) {
    console.error('Failed to fetch pending:', error.message);
    res.status(500).json({ error: 'Failed to fetch pending books' });
  }
});

router.get('/stats', isAdmin, (req, res) => {
  try {
    const totalBooks = books.length;
    const pendingCount = pendingBooks.length;
    const totalUsers = users.length;
    const totalRevenue = books.reduce((sum, b) => sum + ((b.sales || 0) * b.price), 0);
    
    res.json({ totalBooks, pendingCount, totalUsers, totalRevenue: Math.round(totalRevenue * 100) / 100 });
  } catch (error) {
    console.error('Stats error:', error.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.post('/approve/:id', isAdmin, (req, res) => {
  try {
    const bookIndex = pendingBooks.findIndex(b => b.id === req.params.id);
    if (bookIndex === -1) return res.status(404).json({ error: 'Book not found in pending list' });
    
    const book = pendingBooks.splice(bookIndex, 1)[0];
    book.status = 'approved';
    book.approvedAt = new Date().toISOString();
    books.push(book);
    persist();
    
    res.json({ message: 'Book approved successfully!', book });
  } catch (error) {
    console.error('Approve error:', error.message);
    res.status(500).json({ error: 'Failed to approve book' });
  }
});

router.post('/reject/:id', isAdmin, (req, res) => {
  try {
    const bookIndex = pendingBooks.findIndex(b => b.id === req.params.id);
    if (bookIndex === -1) return res.status(404).json({ error: 'Book not found' });
    
    pendingBooks.splice(bookIndex, 1);
    persist();
    
    res.json({ message: 'Book rejected', reason: req.body?.reason || 'No reason provided' });
  } catch (error) {
    console.error('Reject error:', error.message);
    res.status(500).json({ error: 'Failed to reject book' });
  }
});

router.delete('/books/:id', isAdmin, (req, res) => {
  try {
    const bookIndex = books.findIndex(b => b.id === req.params.id);
    if (bookIndex === -1) return res.status(404).json({ error: 'Book not found' });
    
    books.splice(bookIndex, 1);
    persist();
    
    res.json({ message: 'Book deleted' });
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router;
