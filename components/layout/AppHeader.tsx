'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AppHeader() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const Logo = () => <div className="text-xl font-bold text-primary">TO-APP</div>;

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-surface px-4 shadow-sm sm:px-6 dark:bg-slate-800 dark:border-slate-700">
      <div>
        <Logo />
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Bell className="h-5 w-5 text-neutral-700 dark:text-slate-300" />
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                <UserIcon size={16} />
            </div>
            <div className="text-sm">
                <p className="font-semibold text-neutral-900 dark:text-slate-50">{user?.fullName}</p>
                <p className="text-xs text-neutral-700 dark:text-slate-300">{user?.role}</p>
            </div>
        </div>
        <Button onClick={handleLogout} variant="outline" size="sm" className="bg-transparent text-neutral-700 border-neutral-300 hover:bg-muted dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
      </div>
    </header>
  );
}

