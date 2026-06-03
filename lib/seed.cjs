const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOADS = path.join(DATA_DIR, 'uploads');
const THUMBS = path.join(DATA_DIR, 'thumbnails');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function id() {
  return [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Create a tiny valid PDF (minimal PDF that renders text)
function createSamplePDF(text = 'Hello from GrowPDF!') {
  const esc = (t) => t.replace(/[\\()]/g, '\\$&');
  return Buffer.from(
    `%PDF-1.4\n` +
    `1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n` +
    `2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n` +
    `3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n` +
    `4 0 obj<</Length 77>>stream\n` +
    `BT /F1 20 Tf 50 750 Td (${esc(text)}) Tj ET\n` +
    `endstream\nendobj\n` +
    `5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n` +
    `xref\n` +
    `0 6\n` +
    `0000000000 65535 f \n` +
    `0000000009 00000 n \n` +
    `0000000058 00000 n \n` +
    `0000000115 00000 n \n` +
    `0000000266 00000 n \n` +
    `0000000393 00000 n \n` +
    `trailer<</Size 6/Root 1 0 R>>\n` +
    `startxref\n` +
    `468\n` +
    `%%EOF`
  );
}

function createSampleThumbnail() {
  return Buffer.from(
    `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
    'base64'
  );
}

async function seed() {
  await fs.promises.mkdir(DATA_DIR, { recursive: true });
  await fs.promises.mkdir(UPLOADS, { recursive: true });
  await fs.promises.mkdir(THUMBS, { recursive: true });

  // Write sample PDF
  const pdfName = `demo_${Date.now()}_${id().slice(0,8)}.pdf`;
  const thumbName = `demo_${Date.now()}_${id().slice(0,8)}.png`;
  await fs.promises.writeFile(path.join(UPLOADS, pdfName), createSamplePDF());
  await fs.promises.writeFile(path.join(THUMBS, thumbName), createSampleThumbnail());

  const now = new Date().toISOString();
  const bookId = id();

  const db = {
    users: [
      {
        id: 'admin-' + id().slice(0,8),
        name: 'Admin',
        email: 'admin@growpdf.app',
        phone: '0000000000',
        role: 'admin',
        passwordHash: hashPassword('Admin123!'),
        avatar: '',
        upiId: '',
        library: [{ bookId, type: 'buy', purchasedAt: now, expiresAt: null }],
        createdAt: now
      },
      {
        id: 'reader-' + id().slice(0,8),
        name: 'Demo Reader',
        email: 'reader@growpdf.app',
        phone: '1111111111',
        role: 'reader',
        passwordHash: hashPassword('Reader123!'),
        avatar: '',
        upiId: '',
        library: [{ bookId, type: 'buy', purchasedAt: now, expiresAt: null }],
        createdAt: now
      }
    ],
    books: [
      {
        id: bookId,
        title: 'The Art of Reading',
        author: 'Elena Wright',
        description: 'A beautiful journey through the world of literature and imagination. This sample book demonstrates the GrowPDF reading experience with full DRM protection.',
        category: 'Fiction',
        price: 9.99,
        rentPrice: 2.99,
        rentDays: 14,
        isbn: '978-0-123-45678-9',
        pages: 248,
        language: 'English',
        pdf: pdfName,
        thumbnail: thumbName,
        publisherId: 'admin-seed',
        publisherName: 'GrowPDF',
        sales: 42,
        rating: 4.7,
        featured: true,
        createdAt: now,
        approvedAt: now
      }
    ],
    pendingBooks: [],
    coupons: [
      { code: 'WELCOME10', discount: 10, type: 'percent', active: true, usesLeft: 1000 },
      { code: 'SAVE20', discount: 20, type: 'percent', active: true, usesLeft: 500 },
      { code: 'FLAT5', discount: 5, type: 'fixed', active: true, usesLeft: 1000 }
    ],
    payments: []
  };

  await fs.promises.writeFile(DB_FILE, JSON.stringify(db, null, 2));
  console.log('✓ Database seeded with demo data');
  console.log('');
  console.log('  Admin:   admin@growpdf.app / Admin123!');
  console.log('  Reader:  reader@growpdf.app / Reader123!');
  console.log('  Book:    "The Art of Reading" — already in both libraries');
  console.log('');
  console.log('Login as "reader@growpdf.app" → go to Library → click "Read now"');
}

seed().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
