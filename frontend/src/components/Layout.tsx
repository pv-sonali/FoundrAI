import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Terminal,
  KanbanSquare,
  Layers,
  FileText,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  Settings as SettingsIcon,
  Shield,
  Search,
  ChevronDown,
  Bell,
  LogOut,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useStartupStore } from '../store/startupStore';
import { apiRequest } from '../utils/api';
import { CommandPalette } from './CommandPalette';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const {
    startupsList,
    activeStartup,
    setActiveStartup,
    setActiveModules,
    setStartupsList,
    setLoadingModules
  } = useStartupStore();

  const location = useLocation();
  const navigate = useNavigate();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch startups list on load
  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const res = await apiRequest('/startups');
        if (res.success) {
          setStartupsList(res.startups);
          
          // Select startup from localStorage or pick the first one
          const savedId = localStorage.getItem('activeStartupId');
          if (savedId) {
            const found = res.startups.find((s: any) => s._id === savedId);
            if (found) {
              setActiveStartup(found);
              return;
            }
          }
          if (res.startups.length > 0) {
            setActiveStartup(res.startups[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load startups list:', err);
      }
    };
    fetchStartups();
  }, [setStartupsList, setActiveStartup]);

  // Load modules whenever active startup changes
  useEffect(() => {
    if (!activeStartup) {
      setActiveModules(null);
      return;
    }
    const fetchStartupDetails = async () => {
      setLoadingModules(true);
      try {
        const res = await apiRequest(`/startups/${activeStartup._id}`);
        if (res.success && res.modules) {
          setActiveModules(res.modules);
        }
      } catch (err) {
        console.error('Failed to load startup modules:', err);
      } finally {
        setLoadingModules(false);
      }
    };
    fetchStartupDetails();
  }, [activeStartup, setActiveModules, setLoadingModules]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Compass },
    { name: 'My Startups', path: '/startups', icon: Briefcase },
    { name: 'Idea Validator', path: '/idea-validator', icon: Terminal, moduleKey: 'idea' },
    { name: 'Market Research', path: '/market-research', icon: Layers, moduleKey: 'research' },
    { name: 'Competitors Grid', path: '/competitor-intelligence', icon: Layers, moduleKey: 'competitor' },
    { name: 'Business Canvas', path: '/business-model', icon: Layers, moduleKey: 'businessModel' },
    { name: 'MVP Planner', path: '/mvp-planner', icon: KanbanSquare, moduleKey: 'mvpPlan' },
    { name: 'Pitch Decks', path: '/pitch-deck', icon: FileText, moduleKey: 'pitchDeck' },
    { name: 'Funding Hub', path: '/funding-hub', icon: DollarSign, moduleKey: 'funding' },
    { name: 'AI Mentor', path: '/ai-mentor', icon: MessageSquare },
    { name: 'Risk Analyzer', path: '/risk-analyzer', icon: AlertTriangle, moduleKey: 'risk' },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const handleStartupSelect = (startup: any) => {
    setActiveStartup(startup);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white select-none">
      {/* Sidebar */}
      <aside className="w-64 border-r border-dark-border bg-black flex flex-col">
        {/* Brand */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-dark-border">
          <Sparkles className="h-5 w-5 text-gold" />
          <span className="font-bold tracking-wider text-lg font-mono">
            FOUNDR<span className="text-gold">AI</span>
          </span>
          <span className="text-[9px] border border-gold/40 text-gold px-1 rounded-sm uppercase tracking-widest font-mono scale-90">
            Beta
          </span>
        </div>

        {/* Startup Switcher */}
        <div className="p-4 border-b border-dark-border relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between rounded-custom border border-dark-border bg-dark-card hover:bg-dark-border/40 px-3 py-2 text-xs text-left"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-5 w-5 rounded-md bg-gold/15 flex items-center justify-center shrink-0">
                <Briefcase className="h-3 w-3 text-gold" />
              </div>
              <span className="truncate font-medium text-white">
                {activeStartup ? activeStartup.name : 'Create Workspace'}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-gray-500 shrink-0" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-4 right-4 mt-1 z-35 rounded-custom border border-dark-border bg-dark-card shadow-xl overflow-hidden py-1 max-h-40 overflow-y-auto">
              {startupsList.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-gray-500 text-center">
                  No startups created yet
                </div>
              ) : (
                startupsList.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => handleStartupSelect(s)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                      activeStartup?._id === s._id ? 'bg-gold/10 text-gold font-medium' : 'text-gray-400 hover:bg-dark-border/50 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{s.name}</span>
                  </button>
                ))
              )}
              <div className="border-t border-dark-border my-1"></div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/startups');
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-gold hover:bg-gold/5 transition-colors font-medium"
              >
                + Manage Workspace
              </button>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 text-xs rounded-custom transition-all ${
                  isActive
                    ? 'bg-gold/10 text-gold font-medium border-l-2 border-gold pl-2.5'
                    : 'text-gray-400 hover:bg-dark-card hover:text-white'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-gold' : 'text-gray-500'}`} />
                <span className="flex-1 truncate">{item.name}</span>
              </Link>
            );
          })}

          {user?.role === 'admin' && (
            <>
              <div className="border-t border-dark-border my-2 pt-2 text-[10px] text-gray-500 px-3 tracking-widest uppercase font-mono">
                Admin Settings
              </div>
              <Link
                to="/admin-panel"
                className={`flex items-center gap-3 px-3 py-2 text-xs rounded-custom transition-all ${
                  location.pathname === '/admin-panel'
                    ? 'bg-gold/10 text-gold font-medium border-l-2 border-gold pl-2.5'
                    : 'text-gray-400 hover:bg-dark-card hover:text-white'
                }`}
              >
                <Shield className={`h-4.5 w-4.5 ${location.pathname === '/admin-panel' ? 'text-gold' : 'text-gray-500'}`} />
                <span>Admin Cockpit</span>
              </Link>
            </>
          )}
        </nav>

        {/* Footer User Info */}
        <div className="p-4 border-t border-dark-border bg-black flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded-full border border-gold bg-dark-card text-gold text-xs font-bold flex items-center justify-center shrink-0 uppercase">
              {user?.name.substring(0, 2) || 'US'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                {user?.subscription}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-md hover:bg-dark-border text-gray-500 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black">
        {/* Top Header */}
        <header className="h-16 border-b border-dark-border flex items-center justify-between px-8 bg-black">
          {/* Active startup title */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">Workspace:</span>
            <span className="text-xs font-medium text-white bg-dark-card border border-dark-border rounded-md px-2.5 py-1">
              {activeStartup ? activeStartup.name : 'No active workspace'}
            </span>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-4">
            {/* Search shortcut */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 rounded-custom border border-dark-border bg-dark-card hover:bg-dark-border/40 text-gray-500 text-xs px-3 py-1.5 w-48 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">Search tools...</span>
              <kbd className="text-[10px] font-mono border border-dark-border bg-black px-1 rounded-sm text-gray-600 scale-90">
                ⌘K
              </kbd>
            </button>

            {/* AI Credits Badge */}
            <div className="flex items-center gap-1.5 border border-gold/40 rounded-custom bg-gold/5 px-3 py-1.5 text-xs text-gold">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-medium">
                {user?.subscription === 'free'
                  ? `${user?.aiCredits} AI Credits`
                  : `${user?.subscription?.toUpperCase()} Plan`}
              </span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 rounded-full border border-dark-border hover:border-gold/50 bg-dark-card hover:bg-dark-border text-gray-400 hover:text-white transition-all relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-gold"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 z-35 rounded-custom border border-dark-border bg-dark-card shadow-2xl p-4">
                  <h4 className="text-xs font-bold text-white mb-3 flex items-center justify-between border-b border-dark-border pb-2">
                    <span>Recent Notifications</span>
                    <span className="text-[9px] text-gold uppercase tracking-wider font-mono">FoundrAI</span>
                  </h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    <div className="text-[11px] border-b border-dark-border/40 pb-2">
                      <div className="text-gray-400">Welcome to FoundrAI! Click **My Startups** to initialize a new venture.</div>
                      <div className="text-[9px] text-gray-600 mt-1">Just now</div>
                    </div>
                    <div className="text-[11px] border-b border-dark-border/40 pb-2">
                      <div className="text-gray-400">Try validation module for AI SWOT metrics.</div>
                      <div className="text-[9px] text-gray-600 mt-1">2 hours ago</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content viewport */}
        <main className="flex-1 overflow-y-auto bg-black p-8 relative">
          {!activeStartup && location.pathname !== '/startups' && location.pathname !== '/settings' && location.pathname !== '/admin-panel' ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto fade-in">
              <Briefcase className="h-10 w-10 text-gold mb-4" />
              <h2 className="text-lg font-bold text-white mb-2">Create a Startup Workspace</h2>
              <p className="text-xs text-gray-400 mb-6">
                Before utilizing AI mentorship tools, you must define your startup workspace details (name, description, industry, target audience).
              </p>
              <button
                onClick={() => navigate('/startups')}
                className="rounded-custom border border-gold hover:bg-gold text-white hover:text-black font-semibold text-xs px-4 py-2 transition-colors"
              >
                + Create Startup Workspace
              </button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
};
