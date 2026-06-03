import { cookies, headers } from 'next/headers';
import { verifyToken, TOKEN_NAME } from './auth';
import { findUserById } from './db';

export { TOKEN_NAME };

export async function getUserFromRequest() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(TOKEN_NAME)?.value;
    const hdrs = await headers();
    const authHeader = hdrs.get('authorization');
    const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = tokenCookie || bearer;
    if (!token) return null;
    const decoded = verifyToken(token);
    if (!decoded) return null;
    const user = await findUserById(decoded.id);
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getUserFromRequest();
  if (!user) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return user;
}

export async function requirePublisher() {
  const user = await requireAuth();
  if (user.role !== 'publisher' && user.role !== 'admin') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return user;
}

export function jsonError(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

export function jsonOk(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}
