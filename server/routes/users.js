const express = require('express');
const router = express.Router();
const { users, books, persist } = require('../models/database');
const { verifyToken } = require('../utils/auth');

router.get('/library', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const libraryBooks = (user.library || []).map(libItem => {
      const book = books.find(b => b.id === libItem.bookId);
      if (!book) return null;
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        price: book.price,
        pages: book.pages,
        thumbnail: book.thumbnail,
        accessType: libItem.accessType,
        purchasedAt: libItem.purchasedAt,
        expiresAt: libItem.expiresAt
      };
    }).filter(Boolean);
    
    res.json(libraryBooks);
  } catch (error) {
    console.error('Library fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch library' });
  }
});

router.put('/profile', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const userIndex = users.findIndex(u => u.id === decoded.id);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    
    const { name, phone, upiId } = req.body;
    if (name) users[userIndex].name = name.trim();
    if (phone) users[userIndex].phone = phone;
    if (upiId !== undefined) users[userIndex].upiId = upiId;
    
    persist();
    
    const user = users[userIndex];
    res.json({ 
      message: 'Profile updated', 
      user: { id: user.id, email: user.email, name: user.name, role: user.role, upiId: user.upiId, phone: user.phone }
    });
  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
