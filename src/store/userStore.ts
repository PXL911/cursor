import { create } from 'zustand';

interface UserState {
  role: 'manager' | 'director';
  setRole: (role: 'manager' | 'director') => void;
}

export const useUserStore = create<UserState>((set) => ({
  role: 'manager',
  setRole: (role) => set({ role }),
})); 