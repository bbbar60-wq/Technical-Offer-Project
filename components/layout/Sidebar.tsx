'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, FileText, Users, HardHat, Wrench, Settings, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/projects', label: 'Projects', icon: FileText },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/accessories', label: 'Accessories', icon: HardHat },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/test-tools', label: 'Test Tools', icon: Wrench },
  { href: '/spare-parts', label: 'Spare Parts', icon: Settings },
  { href: '/admin/users', label: 'Admin / Users', icon: Users, managerOnly: true },
  { href: '/reports', label: 'Reports/Backups', icon: BarChart2, managerOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-surface p-4 dark:bg-slate-800 dark:border-slate-700">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
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
