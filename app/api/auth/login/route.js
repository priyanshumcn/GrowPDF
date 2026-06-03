import { findUserByEmail, findUserById } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { TOKEN_NAME } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return jsonErr('Email and password are required', 400);
    const user = await findUserByEmail(email);
    if (!user) return jsonErr('Invalid email or password', 401);
    if (!verifyPassword(password, user.passwordHash)) return jsonErr('Invalid email or password', 401);

    const token = generateToken({ id: user.id, role: user.role });
    const { passwordHash, ...safe } = user;
    return jsonWithCookie(token, { user: safe });
  } catch (e) {
    return jsonErr('Login failed', 500);
  }
}

function jsonWithCookie(token, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'set-cookie': `${TOKEN_NAME}=${token}; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax; HttpOnly=false`
    }
  });
}

function jsonErr(msg, status) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: { 'content-type': 'application/json' } });
}
