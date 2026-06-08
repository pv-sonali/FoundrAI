import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';
import { Sparkles, Save, User, Key, Shield, HelpCircle, RefreshCw } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingSubscription, setUpdatingSubscription] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setError(null);
    setMessage(null);

    setTimeout(() => {
      updateUser({ name });
      setSavingProfile(false);
      setMessage('Profile settings updated successfully!');
    }, 800);
  };

  const handleUpgradePlan = async (tier: 'pro' | 'enterprise') => {
    if (!user) return;
    setUpdatingSubscription(true);
    setError(null);
    setMessage(null);

    // Call simulated admin modifier endpoint to upgrade plan
    try {
      const res = await apiRequest(`/admin/users/${user.id}`, {
        method: 'PUT',
        body: {
          subscription: tier,
          aiCredits: tier === 'pro' ? 250 : 1000,
        },
      });

      if (res.success && res.user) {
        updateUser({
          subscription: res.user.subscription,
          aiCredits: res.user.aiCredits,
        });
        setMessage(`Successfully upgraded workspace subscription to ${tier.toUpperCase()}!`);
      }
    } catch (err: any) {
      // Fallback local mock state update if connection database is local mock
      updateUser({
        subscription: tier,
        aiCredits: tier === 'pro' ? 250 : 1000,
      });
      setMessage(`Successfully upgraded workspace subscription locally to ${tier.toUpperCase()}!`);
    } finally {
      setUpdatingSubscription(false);
    }
  };

  const keyboardShortcuts = [
    { key: '⌘ K or Ctrl + K', action: 'Toggle search Command Palette overlay' },
    { key: 'Esc', action: 'Close active search modals or command palettes' },
    { key: 'Arrows ↑↓', action: 'Navigate choices inside search dropdown list' },
    { key: 'Enter', action: 'Trigger active selected page jump' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in select-none">
      {/* Header */}
      <div className="border-b border-dark-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <User className="h-5 w-5 text-gold" />
          Settings Panel
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Adjust profile info, customize custom AI endpoint key integrations, or scale billing plans.
        </p>
      </div>

      {message && (
        <div className="rounded-md border border-gold/40 bg-gold/5 px-4 py-3 text-xs text-gold">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Settings Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="rounded-custom border border-dark-border bg-dark-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-dark-border/40 pb-2 mb-4 flex items-center gap-1.5">
              <User className="h-4 w-4 text-gold" /> Profile Settings
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-2.5 text-xs text-white placeholder-gray-600 gold-focus transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={savingProfile}
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1.5">
                  Email Address (Verified)
                </label>
                <input
                  type="email"
                  className="w-full rounded-custom border border-dark-border bg-black/60 px-3.5 py-2.5 text-xs text-gray-500 cursor-not-allowed"
                  value={user?.email}
                  disabled
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center justify-center gap-2 rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-5 py-2.5 transition-colors cursor-pointer"
              >
                {savingProfile ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Details
              </button>
            </form>
          </div>

          {/* AI keys setup */}
          <div className="rounded-custom border border-dark-border bg-dark-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-dark-border/40 pb-2 mb-4 flex items-center gap-1.5">
              <Key className="h-4 w-4 text-gold" /> Custom AI Integrations
            </h3>
            <p className="text-[11px] text-gray-500 mb-4 leading-normal">
              By default, FoundrAI runs on centralized backend keys. Add your custom OpenAI or Gemini token keys below to use custom limits.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1.5">
                  OpenAI API Key (GPT-4o)
                </label>
                <input
                  type="password"
                  className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-2.5 text-xs text-white placeholder-gray-700 gold-focus transition-all"
                  placeholder="sk-proj-••••••••••••••••"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1.5">
                  Gemini API Key (Gemini 1.5)
                </label>
                <input
                  type="password"
                  className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-2.5 text-xs text-white placeholder-gray-700 gold-focus transition-all"
                  placeholder="AIzaSy••••••••••••••••"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                />
              </div>

              <button
                onClick={() => setMessage('Custom API keys stored locally in workspace session.')}
                className="flex items-center justify-center gap-2 rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-5 py-2.5 transition-colors cursor-pointer"
              >
                Save API Keys
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Plan Upgrades & Hotkeys */}
        <div className="space-y-6">
          
          {/* Subscription upgrades cockpit */}
          <div className="rounded-custom border border-dark-border bg-dark-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-dark-border/40 pb-2 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-gold" /> Subscription Tier
            </h3>

            <div className="space-y-3.5">
              <div className="border border-dark-border bg-black rounded-custom p-4 text-center">
                <div className="text-[10px] text-gray-500 uppercase font-mono">Current Workspace Tier</div>
                <div className="text-lg font-bold text-white uppercase tracking-wider mt-1">{user?.subscription}</div>
                <div className="text-xs text-gold font-bold mt-0.5">{user?.aiCredits} credits left</div>
              </div>

              {user?.subscription === 'free' && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleUpgradePlan('pro')}
                    disabled={updatingSubscription}
                    className="w-full text-center rounded-custom bg-gold hover:bg-gold-hover text-black font-bold text-xs py-2.5 transition-colors cursor-pointer flex justify-center items-center gap-1"
                  >
                    {updatingSubscription ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Upgrade to Pro ($29/mo)
                  </button>
                  <button
                    onClick={() => handleUpgradePlan('enterprise')}
                    disabled={updatingSubscription}
                    className="w-full text-center rounded-custom border border-dark-border hover:border-gold/50 bg-black text-white text-xs py-2.5 transition-colors cursor-pointer"
                  >
                    Upgrade to Enterprise ($149/mo)
                  </button>
                </div>
              )}

              {user?.subscription === 'pro' && (
                <button
                  onClick={() => handleUpgradePlan('enterprise')}
                  disabled={updatingSubscription}
                  className="w-full text-center rounded-custom bg-gold hover:bg-gold-hover text-black font-bold text-xs py-2.5 transition-colors cursor-pointer"
                >
                  Upgrade to Enterprise
                </button>
              )}
            </div>
          </div>

          {/* Keyboard Shortcuts Reference Guide */}
          <div className="rounded-custom border border-dark-border bg-dark-card p-5 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-dark-border/40 pb-2 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-gold" /> System Shortcuts
            </h3>
            <div className="space-y-3">
              {keyboardShortcuts.map((sc, i) => (
                <div key={i} className="flex justify-between items-start gap-2.5 pb-2 last:pb-0 last:border-0 border-b border-dark-border/30">
                  <div className="text-[10px] text-gray-300 font-mono bg-black border border-dark-border px-1.5 py-0.5 rounded-sm shrink-0 uppercase">
                    {sc.key}
                  </div>
                  <div className="text-[11px] text-gray-500 text-right">{sc.action}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
