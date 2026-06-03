import { getUsers, getBooks, getPendingBooks, getPayments } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    const [users, books, pending, payments] = await Promise.all([
      getUsers(), getBooks(), getPendingBooks(), getPayments()
    ]);
    const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
    return json({
      stats: {
        totalUsers: users.length,
        totalBooks: books.length,
        pendingBooks: pending.filter(b => b.status !== 'rejected').length,
        rejectedBooks: pending.filter(b => b.status === 'rejected').length,
        totalSales: books.reduce((s, b) => s + (b.sales || 0), 0),
        totalRevenue: totalRevenue
      }
    });
  } catch (e) {
    if (e.status) return json({ error: e.message }, e.status);
    return json({ error: 'Failed to load' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
