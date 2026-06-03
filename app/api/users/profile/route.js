import { requireAuth, getUserFromRequest } from '@/lib/auth-server';
import { updateUser } from '@/lib/db';
import { validateUPI } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return json({ error: 'Unauthorized' }, 401);
  return json({ user });
}

export async function PATCH(req) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const updates = {};
    if (body.name !== undefined) {
      const t = String(body.name).trim();
      if (t.length < 2) return json({ error: 'Name is too short' }, 400);
      updates.name = t;
    }
    if (body.upiId !== undefined) {
      const v = validateUPI(body.upiId);
      if (!v.valid) return json({ error: v.error }, 400);
      updates.upiId = v.upi;
    }
    if (body.avatar !== undefined) {
      updates.avatar = String(body.avatar).slice(0, 500);
    }
    const updated = await updateUser(user.id, updates);
    const { passwordHash, ...safe } = updated;
    return json({ user: safe });
  } catch (e) {
    if (e.status) return json({ error: e.message }, e.status);
    return json({ error: 'Update failed' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
