'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowRight, User, Lock } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    // --- MOCK API CALL ---
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, you'd get this from the API response
    const mockUser = {
        id: '1',
        fullName: 'John Doe',
        username: data.username,
        role: 'Manager' as 'Manager' | 'Engineer',
    };

    login(mockUser);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-slate-900">
      <div className="w-full max-w-sm rounded-lg bg-surface p-8 shadow-soft dark:bg-slate-800">
        <h1 className="mb-2 text-center text-2xl font-bold text-neutral-900 dark:text-slate-50">Sign in</h1>
        <p className="mb-6 text-center text-sm text-neutral-700 dark:text-slate-400">Welcome to the Technical Offer App</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-slate-400" />
            <Input
              {...register('username')}
              placeholder="Enter Username"
              className="pl-10 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400"
            />
            {errors.username && <p className="mt-1 text-xs text-danger">{errors.username.message}</p>}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-slate-400" />
            <Input
              {...register('password')}
              type="password"
              placeholder="Enter Password"
              className="pl-10 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400"
            />
            {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Enter'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
