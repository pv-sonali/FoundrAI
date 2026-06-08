import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'founder' | 'admin';
  subscription: 'free' | 'pro' | 'enterprise';
  aiCredits: number;
  isVerified: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  initAuth: () => void;
  login: (userData: { token: string; user: User }) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setCredits: (credits: number) => void;
  setError: (err: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  initAuth: () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        set({
          token,
          user: JSON.parse(storedUser),
          isAuthenticated: true,
          loading: false,
        });
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false, loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  login: (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    set({
      token: userData.token,
      user: userData.user,
      isAuthenticated: true,
      error: null,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  setCredits: (credits) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, aiCredits: credits };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  setError: (err) => set({ error: err }),
}));
