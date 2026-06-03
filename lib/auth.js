import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'growpdf-dev-secret-change-me-in-production';
const TOKEN_NAME = 'growpdf_token';
const TOKEN_TTL = '30d';

export { TOKEN_NAME };

export function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
}

export function generateToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}
