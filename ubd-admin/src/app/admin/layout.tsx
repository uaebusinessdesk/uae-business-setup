import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import AdminNav from '@/components/AdminNav';
import ErrorSuppression from '@/components/ErrorSuppression';
import { validateConfig } from '@/config/app';

// Validate configuration on server start (runs once per server instance)
// Only validate in development to avoid blocking production
if (process.env.NODE_ENV === 'development') {
  try {
    validateConfig();
  } catch (error: any) {
    // Log error but don't block startup
    console.error('[Admin Layout] Configuration validation error:', error?.message || error);
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      <ErrorSuppression />
      <AdminNav />
      {children}
    </div>
  );
}

