import { findUserByEmail, addUser } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { TOKEN_NAME } from '@/lib/auth-server';
import { validateEmail, validateName } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return jsonErr('Missing idToken', 400);

    const decoded = decodeMockToken(idToken);
    if (!decoded) return jsonErr('Invalid Google token', 401);

    const vEmail = validateEmail(decoded.email);
    if (!vEmail.valid) return jsonErr(vEmail.error, 400);
    const vName = validateName(decoded.name);
    if (!vName.valid) return jsonErr(vName.error, 400);

    let user = await findUserByEmail(vEmail.email);
    if (!user) {
      user = await addUser({
        name: vName.name,
        email: vEmail.email,
        phone: '',
        role: 'reader',
        passwordHash: '',
        avatar: decoded.picture || '',
        upiId: '',
        googleId: decoded.sub || ''
      });
    }
    const token = generateToken({ id: user.id, role: user.role });
    const { passwordHash, ...safe } = user;
    return jsonWithCookie(token, { user: safe });
  } catch (e) {
    return jsonErr('Google login failed', 500);
  }
}

function decodeMockToken(idToken) {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (!payload.email || !payload.sub) return null;
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || ''
    };
  } catch { return null; }
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
