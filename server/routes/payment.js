const express = require('express');
const router = express.Router();
const { users, books, coupons, persist } = require('../models/database');
const { verifyToken } = require('../utils/auth');

router.post('/create-intent', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { bookId, accessType, rentalDays, couponCode } = req.body;
    const book = books.find(b => b.id === bookId);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    
    let price = accessType === 'buy' ? book.price : (book.rentalPrice * (rentalDays || 1));
    
    if (couponCode) {
      const coupon = coupons.find(c => c.code === couponCode.toUpperCase());
      if (coupon && coupon.isActive && new Date(coupon.expiresAt) > new Date()) {
        price = coupon.type === 'percentage' ? price * (1 - coupon.value / 100) : Math.max(0, price - coupon.value);
      }
    }
    
    res.json({
      clientSecret: `pi_${Date.now()}`,
      amount: Math.round(price * 100) / 100,
      paymentIntent: { id: `pi_${Date.now()}`, amount: price, status: 'pending' }
    });
  } catch (error) {
    console.error('Payment intent error:', error.message);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

router.post('/confirm', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { bookId, accessType, rentalDays } = req.body;
    const book = books.find(b => b.id === bookId);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    
    const now = new Date();
    const expiresAt = accessType === 'rent' 
      ? new Date(now.getTime() + (rentalDays || 1) * 24 * 60 * 60 * 1000).toISOString()
      : null;
    
    user.library.push({
      bookId,
      accessType,
      purchasedAt: now.toISOString(),
      expiresAt
    });
    
    book.sales = (book.sales || 0) + 1;
    persist();
    
    res.json({
      success: true,
      message: 'Payment successful! Your book has been added to your library.',
      libraryItem: user.library[user.library.length - 1]
    });
  } catch (error) {
    console.error('Payment confirm error:', error.message);
    res.status(500).json({ error: 'Payment confirmation failed' });
  }
});

router.post('/validate-coupon', (req, res) => {
  try {
    const { code } = req.body;
    const coupon = coupons.find(c => c.code === code?.toUpperCase());
    
    if (!coupon) return res.json({ valid: false, message: 'Invalid coupon code' });
    if (!coupon.isActive) return res.json({ valid: false, message: 'Coupon is not active' });
    if (new Date(coupon.expiresAt) < new Date()) return res.json({ valid: false, message: 'Coupon has expired' });
    
    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description
      }
    });
  } catch (error) {
    console.error('Coupon validation error:', error.message);
    res.status(500).json({ error: 'Coupon validation failed' });
  }
});

module.exports = router;
