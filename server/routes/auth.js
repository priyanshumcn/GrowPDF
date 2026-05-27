const express = require('express');
const router = express.Router();
const { users, persist } = require('../models/database');
const { generateToken, verifyToken } = require('../utils/auth');
const { validateEmail, validatePhone } = require('../utils/validation');

router.post('/register', async (req, res) => {
  try {
    const { email, phone, password, name, role } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address or temporary emails are not allowed' });
    }
    
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const newUser = {
      id: Date.now().toString(),
      email,
      phone: phone || '',
      password,
      name: name.trim(),
      role: role || 'reader',
      upiId: '',
      createdAt: new Date().toISOString(),
      library: [],
      purchases: [],
      rentals: []
    };
    
    users.push(newUser);
    persist();
    
    const token = generateToken(newUser);
    
    res.status(201).json({
      message: 'Registration successful',
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, upiId: newUser.upiId, createdAt: newUser.createdAt, library: newUser.library },
      token
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = generateToken(user);
    
    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role, upiId: user.upiId, library: user.library, createdAt: user.createdAt },
      token
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

router.post('/google', (req, res) => {
  try {
    const { email, name, picture } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }
    
    let user = users.find(u => u.email === email);
    
    if (!user) {
      user = {
        id: Date.now().toString(),
        email,
        phone: '',
        password: '',
        name,
        picture: picture || null,
        role: 'reader',
        upiId: '',
        createdAt: new Date().toISOString(),
        library: [],
        purchases: [],
        rentals: []
      };
      users.push(user);
      persist();
    }
    
    const token = generateToken(user);
    
    res.json({
      message: 'Google login successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role, upiId: user.upiId, library: user.library, createdAt: user.createdAt },
      token
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(500).json({ error: 'Google login failed. Please try again.' });
  }
});

router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, upiId: user.upiId, library: user.library, createdAt: user.createdAt });
  } catch (error) {
    console.error('Auth check error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
