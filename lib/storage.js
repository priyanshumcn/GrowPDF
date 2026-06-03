import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = path.join(process.cwd(), 'data');

async function ensureDir(dir) {
  try { await fs.mkdir(dir, { recursive: true }); } catch {}
}

export async function saveFile(file, type) {
  const dir = path.join(ROOT, type === 'pdf' ? 'uploads' : 'thumbnails');
  await ensureDir(dir);
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = guessExt(file.name, file.type, type);
  const name = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;
  await fs.writeFile(path.join(dir, name), buf);
  return name;
}

function guessExt(name, mime, type) {
  const lower = (name || '').toLowerCase();
  if (lower.endsWith('.pdf')) return '.pdf';
  if (lower.endsWith('.png')) return '.png';
  if (lower.endsWith('.webp')) return '.webp';
  if (lower.endsWith('.gif')) return '.gif';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return '.jpg';
  if (mime === 'application/pdf') return '.pdf';
  if (type === 'pdf') return '.pdf';
  return '.jpg';
}

export function publicFileUrl(type, filename) {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  if (type === 'pdf') return `/api/files/pdf/${filename}`;
  return `/api/files/thumbnail/${filename}`;
}

export async function readFileBytes(type, filename) {
  const safe = path.basename(filename);
  const dir = path.join(ROOT, type === 'pdf' ? 'uploads' : 'thumbnails');
  const filePath = path.join(dir, safe);
  return fs.readFile(filePath);
}
