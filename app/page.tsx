'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  // Read initial state directly for the first render check
  const isAuthenticated = useAuthStore.getState().isAuthenticated;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-muted dark:bg-slate-900">
      <p className="text-neutral-700 dark:text-slate-400">Loading...</p>
    </div>
  );
}
