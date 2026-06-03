import { findUserByEmail, addUser } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { TOKEN_NAME } from '@/lib/auth-server';
import { validateEmail, validatePhone, validatePassword, validateName } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, password, role } = body || {};

    const vName = validateName(name);
    if (!vName.valid) return jsonErr(vName.error, 400);
    const vEmail = validateEmail(email);
    if (!vEmail.valid) return jsonErr(vEmail.error, 400);
    const vPhone = validatePhone(phone);
    if (!vPhone.valid) return jsonErr(vPhone.error, 400);
    const vPass = validatePassword(password);
    if (!vPass.valid) return jsonErr(vPass.error, 400);

    const userRole = role === 'publisher' ? 'publisher' : 'reader';
    const existing = await findUserByEmail(vEmail.email);
    if (existing) return jsonErr('An account with this email already exists', 409);

    const user = await addUser({
      name: vName.name,
      email: vEmail.email,
      phone: vPhone.phone,
      role: userRole,
      passwordHash: hashPassword(password),
      avatar: '',
      upiId: ''
    });

    const token = generateToken({ id: user.id, role: user.role });
    return jsonWithCookie(token, { user: publicUser(user) }, 201);
  } catch (e) {
    return jsonErr('Registration failed', 500);
  }
}

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
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
