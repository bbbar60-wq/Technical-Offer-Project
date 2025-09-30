import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id: string;
  fullName: string;
  username: string;
  role: 'Manager' | 'Engineer';
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // name of the item in storage (localStorage by default)
    }
  )
);
