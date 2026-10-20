import { handleAdmin } from '@/lib/cs-portal/admin-handler';
import { adminRepository } from '@/lib/cs-portal/admin-repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: { path: string[] } };
function handler(request: Request, context: Context) {
  return handleAdmin(request, context.params.path, adminRepository);
}
export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
