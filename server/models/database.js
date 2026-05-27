const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/database.json');

const defaultData = {
  users: [
    {
      id: '1',
      email: 'admin@growpdf.com',
      phone: '+1234567890',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      upiId: '',
      createdAt: new Date().toISOString(),
      library: [],
      purchases: [],
      rentals: []
    },
    {
      id: '2',
      email: 'publisher@growpdf.com',
      phone: '+1987654321',
      password: 'pub123',
      name: 'John Publisher',
      role: 'publisher',
      upiId: 'john@upi',
      createdAt: new Date().toISOString(),
      library: [],
      purchases: [],
      rentals: []
    },
    {
      id: '3',
      email: 'reader@growpdf.com',
      phone: '+1122334455',
      password: 'read123',
      name: 'Jane Reader',
      role: 'reader',
      upiId: '',
      createdAt: new Date().toISOString(),
      library: [],
      purchases: [],
      rentals: []
    }
  ],
  books: [
    {
      id: '1',
      title: 'The Art of Clean Code',
      author: 'Robert Martin',
      description: 'A comprehensive guide to writing clean, maintainable code. Learn the principles and practices that separate good programmers from great ones.',
      category: 'Technology',
      price: 29.99,
      rentalPrice: 4.99,
      thumbnail: null,
      pdfUrl: null,
      pages: 320,
      language: 'English',
      publisher: 'Tech Publications',
      publishedDate: '2024-01-15',
      isbn: '978-0132350884',
      rating: 4.8,
      reviews: 234,
      sales: 1520,
      status: 'approved',
      createdAt: '2024-01-15T00:00:00.000Z',
      seoTitle: 'The Art of Clean Code - Learn Programming Best Practices',
      seoDescription: 'Master clean code principles with this comprehensive guide.',
      tags: ['programming', 'clean code', 'software engineering']
    },
    {
      id: '2',
      title: 'Mindful Living',
      author: 'Sarah Johnson',
      description: 'Discover the path to inner peace and mindfulness. Practical techniques for living a more present and fulfilled life.',
      category: 'Self-Help',
      price: 19.99,
      rentalPrice: 2.99,
      thumbnail: null,
      pdfUrl: null,
      pages: 256,
      language: 'English',
      publisher: 'Wellness Press',
      publishedDate: '2024-03-20',
      isbn: '978-0123456789',
      rating: 4.6,
      reviews: 189,
      sales: 980,
      status: 'approved',
      createdAt: '2024-03-20T00:00:00.000Z',
      seoTitle: 'Mindful Living - Your Guide to Inner Peace',
      seoDescription: 'Transform your life with mindfulness techniques.',
      tags: ['mindfulness', 'self-help', 'meditation']
    },
    {
      id: '3',
      title: 'Digital Marketing Mastery',
      author: 'Michael Chen',
      description: 'Master the art of digital marketing with proven strategies for SEO, social media, content marketing, and more.',
      category: 'Business',
      price: 34.99,
      rentalPrice: 5.99,
      thumbnail: null,
      pdfUrl: null,
      pages: 412,
      language: 'English',
      publisher: 'Business Books Inc',
      publishedDate: '2024-02-10',
      isbn: '978-0987654321',
      rating: 4.7,
      reviews: 312,
      sales: 2100,
      status: 'approved',
      createdAt: '2024-02-10T00:00:00.000Z',
      seoTitle: 'Digital Marketing Mastery - Complete Guide',
      seoDescription: 'Learn digital marketing from scratch. SEO, social media, content strategy and more.',
      tags: ['marketing', 'digital', 'business', 'seo']
    },
    {
      id: '4',
      title: 'The Creative Mind',
      author: 'Emma Williams',
      description: 'Unlock your creative potential with exercises and insights from a leading creativity expert.',
      category: 'Art & Design',
      price: 24.99,
      rentalPrice: 3.99,
      thumbnail: null,
      pdfUrl: null,
      pages: 288,
      language: 'English',
      publisher: 'Creative Press',
      publishedDate: '2024-04-05',
      isbn: '978-0456789123',
      rating: 4.5,
      reviews: 156,
      sales: 750,
      status: 'approved',
      createdAt: '2024-04-05T00:00:00.000Z',
      seoTitle: 'The Creative Mind - Unlock Your Potential',
      seoDescription: 'Discover techniques to boost your creativity.',
      tags: ['creativity', 'art', 'design', 'innovation']
    },
    {
      id: '5',
      title: 'Financial Freedom Blueprint',
      author: 'David Thompson',
      description: 'Your complete guide to achieving financial independence. Learn investing, budgeting, and wealth-building strategies.',
      category: 'Finance',
      price: 27.99,
      rentalPrice: 4.49,
      thumbnail: null,
      pdfUrl: null,
      pages: 345,
      language: 'English',
      publisher: 'Money Matters Publishing',
      publishedDate: '2024-05-12',
      isbn: '978-0789123456',
      rating: 4.9,
      reviews: 421,
      sales: 3200,
      status: 'approved',
      createdAt: '2024-05-12T00:00:00.000Z',
      seoTitle: 'Financial Freedom Blueprint - Achieve Wealth',
      seoDescription: 'Master personal finance and investing.',
      tags: ['finance', 'investing', 'wealth', 'money']
    },
    {
      id: '6',
      title: 'Python for Data Science',
      author: 'Dr. Lisa Park',
      description: 'A hands-on guide to data science with Python. Covers pandas, numpy, matplotlib, and machine learning.',
      category: 'Technology',
      price: 39.99,
      rentalPrice: 6.99,
      thumbnail: null,
      pdfUrl: null,
      pages: 520,
      language: 'English',
      publisher: 'Data Science Press',
      publishedDate: '2024-06-01',
      isbn: '978-0321654987',
      rating: 4.7,
      reviews: 267,
      sales: 1890,
      status: 'approved',
      createdAt: '2024-06-01T00:00:00.000Z',
      seoTitle: 'Python for Data Science - Complete Guide',
      seoDescription: 'Learn data science with Python from basics to machine learning.',
      tags: ['python', 'data science', 'machine learning', 'programming']
    },
    {
      id: '7',
      title: 'The Stoic Path',
      author: 'Marcus Reed',
      description: 'Ancient wisdom for modern life. Discover how Stoic philosophy can help you navigate challenges with grace and resilience.',
      category: 'Philosophy',
      price: 18.99,
      rentalPrice: 2.49,
      thumbnail: null,
      pdfUrl: null,
      pages: 224,
      language: 'English',
      publisher: 'Wisdom Publications',
      publishedDate: '2024-07-15',
      isbn: '978-0654321987',
      rating: 4.4,
      reviews: 198,
      sales: 890,
      status: 'approved',
      createdAt: '2024-07-15T00:00:00.000Z',
      seoTitle: 'The Stoic Path - Ancient Wisdom for Modern Life',
      seoDescription: 'Apply Stoic philosophy to your daily life.',
      tags: ['philosophy', 'stoicism', 'self-improvement']
    },
    {
      id: '8',
      title: 'UX Design Fundamentals',
      author: 'Alex Rivera',
      description: 'Master the principles of user experience design. From research to prototyping, learn what makes great digital products.',
      category: 'Art & Design',
      price: 32.99,
      rentalPrice: 5.49,
      thumbnail: null,
      pdfUrl: null,
      pages: 380,
      language: 'English',
      publisher: 'Design Hub Press',
      publishedDate: '2024-08-20',
      isbn: '978-0147258369',
      rating: 4.6,
      reviews: 145,
      sales: 670,
      status: 'approved',
      createdAt: '2024-08-20T00:00:00.000Z',
      seoTitle: 'UX Design Fundamentals - Create Great Experiences',
      seoDescription: 'Learn UX design from scratch.',
      tags: ['ux', 'design', 'user experience', 'prototyping']
    }
  ],
  pendingBooks: [],
  coupons: [
    { id: '1', code: 'WELCOME20', type: 'percentage', value: 20, description: '20% off your first purchase', isActive: true, expiresAt: '2026-12-31T23:59:59.000Z', minPurchase: 10, usageLimit: 1000, usedCount: 45 },
    { id: '2', code: 'SAVE5', type: 'fixed', value: 5, description: '$5 off any purchase', isActive: true, expiresAt: '2026-12-31T23:59:59.000Z', minPurchase: 15, usageLimit: 500, usedCount: 123 },
    { id: '3', code: 'READER50', type: 'percentage', value: 50, description: '50% off for loyal readers', isActive: true, expiresAt: '2026-06-30T23:59:59.000Z', minPurchase: 20, usageLimit: 100, usedCount: 67 }
  ]
};

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load data file, using defaults:', err.message);
  }
  return JSON.parse(JSON.stringify(defaultData));
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users, books, pendingBooks, coupons }, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save data:', err.message);
  }
}

const data = loadData();
const users = data.users;
const books = data.books;
const pendingBooks = data.pendingBooks;
const coupons = data.coupons;

const persist = () => saveData();

module.exports = { users, books, pendingBooks, coupons, persist };
