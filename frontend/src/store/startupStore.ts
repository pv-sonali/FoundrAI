import { create } from 'zustand';

interface Startup {
  _id: string;
  name: string;
  description: string;
  industry: string;
  targetAudience: string;
  createdAt: string;
}

interface StartupModules {
  idea?: any;
  research?: any;
  competitor?: any;
  businessModel?: any;
  mvpPlan?: any;
  pitchDeck?: any;
  funding?: any;
  risk?: any;
  tasks?: any[];
  chatCount?: number;
  analytics?: any[];
}

interface StartupState {
  startupsList: Startup[];
  activeStartup: Startup | null;
  activeModules: StartupModules | null;
  loading: boolean;
  loadingModules: boolean;
  error: string | null;

  setStartupsList: (startups: Startup[]) => void;
  setActiveStartup: (startup: Startup | null) => void;
  setActiveModules: (modules: StartupModules | null) => void;
  setLoading: (loading: boolean) => void;
  setLoadingModules: (loading: boolean) => void;
  clearActiveStartup: () => void;
}

export const useStartupStore = create<StartupState>((set) => ({
  startupsList: [],
  activeStartup: null,
  activeModules: null,
  loading: false,
  loadingModules: false,
  error: null,

  setStartupsList: (startups) => set({ startupsList: startups }),
  
  setActiveStartup: (startup) => {
    set({ activeStartup: startup });
    if (startup) {
      localStorage.setItem('activeStartupId', startup._id);
    } else {
      localStorage.removeItem('activeStartupId');
      set({ activeModules: null });
    }
  },

  setActiveModules: (modules) => set({ activeModules: modules }),
  setLoading: (loading) => set({ loading }),
  setLoadingModules: (loadingModules) => set({ loadingModules }),
  
  clearActiveStartup: () => {
    localStorage.removeItem('activeStartupId');
    set({ activeStartup: null, activeModules: null });
  },
}));
