import React, { useState } from 'react';
import { useStartupStore } from '../store/startupStore';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';
import { Sparkles, Briefcase, Trash2, ArrowRight, RefreshCw, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Startups: React.FC = () => {
  const navigate = useNavigate();
  const {
    startupsList,
    activeStartup,
    setActiveStartup,
    setStartupsList,
    clearActiveStartup
  } = useStartupStore();
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleNewWorkspaceClick = () => {
    if (user?.subscription === 'free' && startupsList.length >= 1) {
      setShowUpgradeModal(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !industry || !targetAudience) {
      setError('Please provide all details.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/startups', {
        method: 'POST',
        body: { name, description, industry, targetAudience },
      });

      if (res.success && res.startup) {
        setStartupsList([res.startup, ...startupsList]);
        setActiveStartup(res.startup);
        
        // Reset form
        setName('');
        setDescription('');
        setIndustry('');
        setTargetAudience('');
        setIsModalOpen(false);
        
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this startup and all its associated AI modules? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await apiRequest(`/startups/${id}`, {
        method: 'DELETE',
      });

      if (res.success) {
        const filtered = startupsList.filter((s) => s._id !== id);
        setStartupsList(filtered);
        
        if (activeStartup?._id === id) {
          if (filtered.length > 0) {
            setActiveStartup(filtered[0]);
          } else {
            clearActiveStartup();
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete startup:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectStartup = (s: any) => {
    setActiveStartup(s);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in select-none">
      {/* Header */}
      <div className="border-b border-dark-border pb-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gold" />
            Startup Workspace Manager
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create multiple startup workspaces to validate different business ideas independently.
          </p>
        </div>
        <button
          onClick={handleNewWorkspaceClick}
          className="flex items-center gap-2 rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-5 py-2.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> New Workspace
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Existing Startups List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Active Startup Hubs ({startupsList.length})
        </h3>

          {startupsList.length === 0 ? (
            <div className="rounded-custom border border-dark-border bg-dark-card p-8 text-center text-gray-500 text-xs">
              No startups workspaces initialized. Use the form to start.
            </div>
          ) : (
            <div className="space-y-3">
              {startupsList.map((s) => {
                const isActive = activeStartup?._id === s._id;
                const isDeleting = deletingId === s._id;
                return (
                  <div
                    key={s._id}
                    onClick={() => handleSelectStartup(s)}
                    className={`rounded-custom border p-5 flex justify-between items-start cursor-pointer transition-all hover:bg-dark-border/20 ${
                      isActive ? 'border-gold bg-gold/5' : 'border-dark-border bg-dark-card'
                    }`}
                  >
                    <div className="space-y-2 overflow-hidden flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">{s.name}</h4>
                        <span className="text-[10px] text-gold font-mono border border-gold/40 px-2 py-0.5 rounded-sm uppercase scale-90">
                          {s.industry}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2 pr-4 leading-relaxed">
                        {s.description}
                      </p>
                      <div className="text-[9px] text-gray-500 font-mono">
                        Audience: {s.targetAudience}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isActive && (
                        <span className="text-[9px] border border-gold text-gold font-mono px-2 py-0.5 rounded-md uppercase tracking-wider scale-90">
                          Active
                        </span>
                      )}
                      <button
                        onClick={(e) => handleDelete(s._id, e)}
                        disabled={isDeleting}
                        className="p-2 rounded-custom hover:bg-dark-border text-gray-500 hover:text-red-500 transition-colors"
                        title="Delete venture workspace"
                      >
                        {isDeleting ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-gold" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* Modal Overlay for Initialize Workspace */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 fade-in">
          <div className="rounded-custom border border-dark-border bg-dark-card w-full max-w-lg p-6 relative shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-dark-border transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-b border-dark-border pb-3 mb-5">
              <Sparkles className="h-4 w-4 text-gold animate-pulse" />
              Initialize Workspace
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">
                  Startup Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-2.5 text-xs text-white placeholder-gray-700 gold-focus transition-all"
                  placeholder="e.g. FoundrAI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">
                  Industry Sector
                </label>
                <input
                  type="text"
                  className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-2.5 text-xs text-white placeholder-gray-700 gold-focus transition-all"
                  placeholder="e.g. B2B SaaS, FinTech"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">
                  Target Customer Segment
                </label>
                <input
                  type="text"
                  className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-2.5 text-xs text-white placeholder-gray-700 gold-focus transition-all"
                  placeholder="e.g. Small business founders, developers"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">
                  Elevator Pitch / Description
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-2.5 text-xs text-white placeholder-gray-700 gold-focus transition-all resize-none leading-relaxed"
                  placeholder="Explain the startup idea, core customer pain points, and product solution in 2-3 sentences..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs py-3 mt-2 transition-colors cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Build Workspace <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade Limit Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 fade-in">
          <div className="rounded-custom border border-dark-border bg-dark-card w-full max-w-sm p-8 text-center relative shadow-2xl">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-dark-border transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-6 w-6 text-gold" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Workspace Limit Reached</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              You're currently on the Free plan, which allows up to 1 startup workspace. Upgrade to Pro or Enterprise to build multiple ventures simultaneously.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/settings')}
                className="w-full rounded-custom bg-gold hover:bg-gold-hover text-black font-bold text-xs py-3 transition-colors cursor-pointer"
              >
                View Upgrade Plans
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full rounded-custom border border-dark-border hover:bg-dark-border text-white text-xs py-3 transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
