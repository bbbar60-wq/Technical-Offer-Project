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
  isSidebarOpen: boolean; // <-- NEW
  login: (user: User) => void;
  logout: () => void;
  toggleSidebar: () => void; // <-- NEW
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isSidebarOpen: true, // Default to open
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })), // <-- NEW
    }),
    {
      name: 'auth-storage', // name of the item in storage (localStorage by default)
    }
  )
);

