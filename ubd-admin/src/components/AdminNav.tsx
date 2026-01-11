'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-8">
            <Link
              href="/admin"
              className={`px-3 py-2 text-sm font-medium ${
                isActive('/admin')
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/leads"
              className={`px-3 py-2 text-sm font-medium ${
                isActive('/admin/leads')
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Leads
            </Link>
            <Link
              href="/admin/callbacks"
              className={`px-3 py-2 text-sm font-medium ${
                isActive('/admin/callbacks')
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Callbacks
            </Link>
            <Link
              href="/admin/agents"
              className={`px-3 py-2 text-sm font-medium ${
                isActive('/admin/agents')
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Agents
            </Link>
            <Link
              href="/admin/seo/insights"
              className={`px-3 py-2 text-sm font-medium ${
                isActive('/admin/seo/insights')
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              SEO Insights
            </Link>
            <Link
              href="/admin/seo/analytics"
              className={`px-3 py-2 text-sm font-medium ${
                isActive('/admin/seo/analytics')
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              SEO Analytics
            </Link>
          </div>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}

