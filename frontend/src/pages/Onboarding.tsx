import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useStartupStore } from '../store/startupStore';
import { apiRequest } from '../utils/api';
import { Rocket, Loader2 } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setStartupsList, setActiveStartup } = useStartupStore();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [servingAs, setServingAs] = useState<string[]>([]);
  const [links, setLinks] = useState<{ [key: string]: string }>({});
  const [referralSource, setReferralSource] = useState('');

  const toggleServing = (platform: string) => {
    setServingAs(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const [progressStatus, setProgressStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLaunch = async () => {
    if (!name || !description || !industry || !targetAudience || servingAs.length === 0 || !referralSource) {
      setError('Please fill out all fields before launching.');
      return;
    }

    setError(null);
    setStep(4); // Launching step

    try {
      setProgressStatus('Initializing Workspace...');
      const res = await apiRequest('/startups', {
        method: 'POST',
        body: { name, description, industry, targetAudience, servingAs, links, referralSource },
      });

      if (!res.success || !res.startup) throw new Error('Failed to create workspace.');

      const newStartup = res.startup;
      setActiveStartup(newStartup);
      setStartupsList([newStartup]);

      // 5 AI Agents Tasks
      const tasks = [
        { ep: '/ai/validate', msg: 'Mentor Agent validating idea...' },
        { ep: '/ai/research', msg: 'Market Analyst generating market sizes...' },
        { ep: '/ai/competitors', msg: 'Market Analyst finding competitors...' },
        { ep: '/ai/business-model', msg: 'Business Consultant structuring model...' },
        { ep: '/ai/mvp-plan', msg: 'Product Manager building MVP plan...' },
        { ep: '/ai/pitch-deck', msg: 'Risk & VC Advisor generating pitch deck...' },
        { ep: '/ai/funding', msg: 'Risk & VC Advisor searching funding...' },
        { ep: '/ai/risk-analysis', msg: 'Risk & VC Advisor analyzing risks...' },
      ];

      for (const t of tasks) {
        setProgressStatus(t.msg);
        try {
          await apiRequest(t.ep, {
            method: 'POST',
            body: { startupId: newStartup._id },
          });
        } catch (e) {
          console.warn(`Failed AI task: ${t.ep}`, e);
          // Continue even if one fails
        }
      }

      setProgressStatus('Launch Sequence Complete!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Error during launch sequence.');
      setStep(1);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 select-none">
      <div className="w-full max-w-lg rounded-custom border border-dark-border bg-dark-card p-8 shadow-2xl fade-in">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="h-12 w-12 rounded-full border border-gold bg-black flex items-center justify-center mb-4">
            <Rocket className="h-6 w-6 text-gold" />
          </div>
          <h2 className="text-2xl font-bold tracking-wider text-white">
            Welcome, {user?.name?.split(' ')[0] || 'Founder'}
          </h2>
          <p className="text-xs text-gray-500 mt-2 tracking-widest uppercase font-mono">
            Configure Your Startup AI Agents
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-900 bg-red-950/20 px-4 py-3 text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 fade-in">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">
                Startup Name
              </label>
              <input
                type="text"
                className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-3 text-sm text-white placeholder-gray-600 gold-focus transition-all"
                placeholder="e.g. FoundrAI"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">
                Elevator Pitch / Description
              </label>
              <textarea
                rows={3}
                className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-3 text-sm text-white placeholder-gray-600 gold-focus transition-all resize-none"
                placeholder="What does your startup do?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!name || !description}
              className="w-full rounded-custom bg-dark-border hover:bg-gray-800 text-white font-medium text-xs py-3.5 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Audience
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 fade-in">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">
                Industry Sector
              </label>
              <input
                type="text"
                className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-3 text-sm text-white placeholder-gray-600 gold-focus transition-all"
                placeholder="e.g. B2B SaaS, HealthTech"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">
                Target Audience
              </label>
              <input
                type="text"
                className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-3 text-sm text-white placeholder-gray-600 gold-focus transition-all"
                placeholder="e.g. Small business owners"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 rounded-custom border border-dark-border bg-transparent hover:bg-dark-border/40 text-gray-400 font-medium text-xs py-3.5 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!industry || !targetAudience}
                className="w-2/3 flex items-center justify-center gap-2 rounded-custom bg-dark-border hover:bg-gray-800 text-white font-medium text-xs py-3.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Platform
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 fade-in max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">
                Serving As (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Web', 'Android', 'iOS', 'Social Media', 'Other'].map(platform => (
                  <button
                    key={platform}
                    onClick={() => toggleServing(platform)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                      servingAs.includes(platform)
                        ? 'bg-gold/20 border-gold text-gold'
                        : 'bg-dark-card border-dark-border text-gray-400 hover:text-white'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {servingAs.length > 0 && (
              <div className="space-y-3 p-4 border border-dark-border rounded-custom bg-black/50">
                <label className="block text-[10px] text-gold uppercase tracking-widest font-mono mb-1">
                  Platform Links (Optional)
                </label>
                {servingAs.includes('Web') && (
                  <input
                    type="url"
                    placeholder="Website URL"
                    className="w-full rounded-custom border border-dark-border bg-black px-3 py-2 text-xs text-white placeholder-gray-600 gold-focus"
                    value={links.Web || ''}
                    onChange={(e) => setLinks({ ...links, Web: e.target.value })}
                  />
                )}
                {servingAs.includes('Android') && (
                  <input
                    type="url"
                    placeholder="Play Store Link"
                    className="w-full rounded-custom border border-dark-border bg-black px-3 py-2 text-xs text-white placeholder-gray-600 gold-focus"
                    value={links.Android || ''}
                    onChange={(e) => setLinks({ ...links, Android: e.target.value })}
                  />
                )}
                {servingAs.includes('iOS') && (
                  <input
                    type="url"
                    placeholder="App Store Link"
                    className="w-full rounded-custom border border-dark-border bg-black px-3 py-2 text-xs text-white placeholder-gray-600 gold-focus"
                    value={links.iOS || ''}
                    onChange={(e) => setLinks({ ...links, iOS: e.target.value })}
                  />
                )}
                {servingAs.includes('Social Media') && (
                  <input
                    type="url"
                    placeholder="Main Social Page Link"
                    className="w-full rounded-custom border border-dark-border bg-black px-3 py-2 text-xs text-white placeholder-gray-600 gold-focus"
                    value={links['Social Media'] || ''}
                    onChange={(e) => setLinks({ ...links, 'Social Media': e.target.value })}
                  />
                )}
                {servingAs.includes('Other') && (
                  <input
                    type="url"
                    placeholder="Other Link"
                    className="w-full rounded-custom border border-dark-border bg-black px-3 py-2 text-xs text-white placeholder-gray-600 gold-focus"
                    value={links.Other || ''}
                    onChange={(e) => setLinks({ ...links, Other: e.target.value })}
                  />
                )}
              </div>
            )}

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1 mt-4">
                Where did you hear about FoundrAI?
              </label>
              <select
                className="w-full rounded-custom border border-dark-border bg-black px-3.5 py-3 text-sm text-white placeholder-gray-600 gold-focus transition-all"
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
              >
                <option value="" disabled>Select an option</option>
                <option value="Social Media">Social Media (Twitter, LinkedIn, etc.)</option>
                <option value="Search Engine">Search Engine (Google, Bing)</option>
                <option value="Friend or Colleague">Friend or Colleague</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 rounded-custom border border-dark-border bg-transparent hover:bg-dark-border/40 text-gray-400 font-medium text-xs py-3.5 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleLaunch}
                disabled={servingAs.length === 0 || !referralSource}
                className="w-2/3 flex items-center justify-center gap-2 rounded-custom bg-gold hover:bg-gold-hover text-black font-bold text-xs py-3.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Rocket className="h-4 w-4" /> Launch Startup
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center space-y-6 py-8 fade-in">
            <Loader2 className="h-10 w-10 text-gold animate-spin" />
            <div className="text-center">
              <p className="text-sm text-white font-medium mb-1">{progressStatus}</p>
              <p className="text-xs text-gray-500">
                5 AI Agents are working on your startup data. This may take up to 2 minutes...
              </p>
            </div>
          </div>
        )}

      </div>

      <div className="mt-8 text-center w-full max-w-lg">
        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
          &copy; {new Date().getFullYear()} FoundrAI. All rights reserved.
        </p>
      </div>
    </div>
  );
};
