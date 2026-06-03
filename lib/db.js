import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

let cache = null;
let writeLock = null;

async function ensureDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch {}
}

export async function readDB() {
  if (cache) return cache;
  await ensureDir();
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    cache = JSON.parse(raw);
    if (!cache.users) cache.users = [];
    if (!cache.books) cache.books = [];
    if (!cache.pendingBooks) cache.pendingBooks = [];
    if (!cache.coupons) cache.coupons = [];
    if (!cache.payments) cache.payments = [];
    return cache;
  } catch {
    cache = {
      users: [],
      books: [],
      pendingBooks: [],
      coupons: defaultCoupons(),
      payments: []
    };
    return cache;
  }
}

export async function writeDB(db) {
  cache = db;
  await ensureDir();
  while (writeLock) await writeLock;
  writeLock = (async () => {
    const tmp = DB_FILE + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, DB_FILE);
  })();
  try { await writeLock; } finally { writeLock = null; }
}

function defaultCoupons() {
  return [
    { code: 'WELCOME10', discount: 10, type: 'percent', active: true, usesLeft: 1000 },
    { code: 'SAVE20', discount: 20, type: 'percent', active: true, usesLeft: 500 },
    { code: 'FLAT5', discount: 5, type: 'fixed', active: true, usesLeft: 1000 }
  ];
}

export async function getUsers() { const db = await readDB(); return db.users; }
export async function getBooks() { const db = await readDB(); return db.books; }
export async function getPendingBooks() { const db = await readDB(); return db.pendingBooks; }
export async function getCoupons() { const db = await readDB(); return db.coupons; }
export async function getPayments() { const db = await readDB(); return db.payments; }

export async function findUserById(id) {
  const users = await getUsers();
  return users.find(u => u.id === id) || null;
}

export async function findUserByEmail(email) {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function addUser(user) {
  const db = await readDB();
  user.id = user.id || cryptoRandomId();
  user.createdAt = user.createdAt || new Date().toISOString();
  user.library = user.library || [];
  db.users.push(user);
  await writeDB(db);
  return user;
}

export async function updateUser(id, updates) {
  const db = await readDB();
  const i = db.users.findIndex(u => u.id === id);
  if (i === -1) return null;
  db.users[i] = { ...db.users[i], ...updates };
  await writeDB(db);
  return db.users[i];
}

export async function addToUserLibrary(userId, entry) {
  const db = await readDB();
  const u = db.users.find(x => x.id === userId);
  if (!u) return null;
  u.library = u.library || [];
  const existing = u.library.find(l => l.bookId === entry.bookId);
  if (existing) {
    Object.assign(existing, entry);
  } else {
    u.library.push({ ...entry, addedAt: new Date().toISOString() });
  }
  await writeDB(db);
  return u;
}

export async function findBookById(id) {
  const books = await getBooks();
  return books.find(b => b.id === id) || null;
}

export async function findPendingBookById(id) {
  const books = await getPendingBooks();
  return books.find(b => b.id === id) || null;
}

export async function addBook(book) {
  const db = await readDB();
  book.id = book.id || cryptoRandomId();
  book.createdAt = book.createdAt || new Date().toISOString();
  book.sales = book.sales || 0;
  book.rating = book.rating || 0;
  book.featured = book.featured || false;
  db.books.push(book);
  await writeDB(db);
  return book;
}

export async function addPendingBook(book) {
  const db = await readDB();
  book.id = book.id || cryptoRandomId();
  book.submittedAt = new Date().toISOString();
  book.status = 'pending';
  db.pendingBooks.push(book);
  await writeDB(db);
  return book;
}

export async function approveBook(id) {
  const db = await readDB();
  const i = db.pendingBooks.findIndex(b => b.id === id);
  if (i === -1) return null;
  const [book] = db.pendingBooks.splice(i, 1);
  book.status = 'approved';
  book.approvedAt = new Date().toISOString();
  book.sales = 0;
  book.rating = 0;
  book.featured = false;
  db.books.push(book);
  await writeDB(db);
  return book;
}

export async function rejectBook(id, reason) {
  const db = await readDB();
  const i = db.pendingBooks.findIndex(b => b.id === id);
  if (i === -1) return null;
  const [book] = db.pendingBooks.splice(i, 1);
  book.status = 'rejected';
  book.rejectionReason = reason || '';
  book.rejectedAt = new Date().toISOString();
  db.pendingBooks.push(book);
  await writeDB(db);
  return book;
}

export async function incrementBookSales(id, n = 1) {
  const db = await readDB();
  const b = db.books.find(x => x.id === id);
  if (!b) return null;
  b.sales = (b.sales || 0) + n;
  await writeDB(db);
  return b;
}

export async function findCouponByCode(code) {
  const coupons = await getCoupons();
  return coupons.find(c => c.code.toLowerCase() === code.toLowerCase() && c.active) || null;
}

export async function recordPayment(payment) {
  const db = await readDB();
  payment.id = payment.id || cryptoRandomId();
  payment.createdAt = new Date().toISOString();
  db.payments.push(payment);
  await writeDB(db);
  return payment;
}

export function cryptoRandomId() {
  return [...crypto.getRandomValues(new Uint8Array(12))]
    .map(b => b.toString(16).padStart(2, '0')).join('');
}
