'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, FileText, Users, HardHat, Wrench, Settings, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/projects', label: 'Projects', icon: FileText },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/accessories', label: 'Accessories', icon: HardHat }, // Assuming Accessories page exists or will be added
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/test-tools', label: 'Test Tools', icon: Wrench }, // Correct icon and path
  { href: '/spare-parts', label: 'Spare Parts', icon: Settings }, // Assuming Spare Parts page exists or will be added
  { href: '/admin/users', label: 'Admin / Users', icon: Users, managerOnly: true },
  { href: '/reports', label: 'Reports/Backups', icon: BarChart2, managerOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen } = useAuthStore();
  const { user } = useAuthStore();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-20 flex h-full w-64 flex-col border-r bg-surface p-4 pt-20 transition-transform duration-300 ease-in-out dark:bg-slate-800 dark:border-slate-700',
        'transform',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          if (item.managerOnly && user?.role !== 'Manager') {
            return null;
          }

          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard' || pathname === '/'
            : (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-neutral-700 hover:bg-muted dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

