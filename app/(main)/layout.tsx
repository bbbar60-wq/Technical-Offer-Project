'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AppHeader from '@/components/layout/AppHeader';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isSidebarOpen, toggleSidebar } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    // You can show a loading spinner here while redirecting
    return (
        <div className="flex h-screen items-center justify-center bg-muted dark:bg-slate-900">
            <p className="dark:text-slate-50">Loading...</p>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />

        {/* Main Content Area with Dynamic Margin */}
        <main
          className={cn(
            'flex-1 overflow-y-auto p-6 transition-all duration-300 ease-in-out',
            isSidebarOpen ? 'lg:ml-64' : 'ml-0' // Apply margin on large screens
          )}
        >
          {children}
        </main>
      </div>

      {/* Sidebar Overlay for mobile */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-10 bg-black/30 lg:hidden"
        />
      )}
    </div>
  );
}

