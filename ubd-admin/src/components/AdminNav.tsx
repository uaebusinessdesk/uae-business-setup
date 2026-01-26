'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  const linkClass = (path: string) =>
    `px-3 py-2 text-sm font-medium ${
      isActive(path)
        ? 'text-indigo-600 border-b-2 border-indigo-600'
        : 'text-gray-500 hover:text-gray-700'
    }`;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-8">
            <Link href="/admin" className={linkClass('/admin')}>Dashboard</Link>
            <Link href="/admin/leads" className={linkClass('/admin/leads')}>Leads</Link>
            <Link href="/admin/callbacks" className={linkClass('/admin/callbacks')}>Callbacks</Link>
            <Link href="/admin/agents" className={linkClass('/admin/agents')}>Agents</Link>
          </div>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
