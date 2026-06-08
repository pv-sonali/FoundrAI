import React, { useState } from 'react';
import { useStartupStore } from '../store/startupStore';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';
import { RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';

interface Competitor {
  name: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  marketGaps: string[];
}

export const CompetitorIntelligence: React.FC = () => {
  const { setCredits } = useAuthStore();
  const { activeStartup, activeModules, setActiveModules } = useStartupStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const competitorData = activeModules?.competitor;

  const handleGenerate = async () => {
    if (!activeStartup) return;
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/ai/competitors', {
        method: 'POST',
        body: { startupId: activeStartup._id },
      });

      if (res.success) {
        if (res.userCredits !== undefined) {
          setCredits(res.userCredits);
        }
        setActiveModules({
          ...activeModules,
          competitor: res.competitor,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-dark-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-gold" />
            Competitor Intelligence
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Map direct rivals, study their pricing systems, and spot market gaps to gain competitive edge.
          </p>
        </div>
        {activeStartup && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 rounded-custom bg-gold hover:bg-gold-hover disabled:bg-dark-border text-black disabled:text-gray-500 font-semibold text-xs px-4 py-2 transition-colors cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : competitorData ? (
              'Re-Analyze Competitors'
            ) : (
              'Generate Competitors Map'
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {!competitorData && !loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-12 text-center">
          <ShieldAlert className="h-10 w-10 text-gold/40 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">No Competitor Mapping Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            Generate an interactive competitor analysis grid for <strong className="text-white font-bold">{activeStartup?.name}</strong>.
          </p>
          <button
            onClick={handleGenerate}
            className="rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-5 py-2.5 transition-colors cursor-pointer"
          >
            Run Competitor Map (Uses 1 Credit)
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-20 text-center">
          <RefreshCw className="h-10 w-10 text-gold animate-spin mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">Mapping Global Alternatives</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Extracting features from rival websites, calculating pricing benchmarks, and identifying feature gaps...
          </p>
        </div>
      )}

      {competitorData && !loading && (
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Competitor Comparison Matrix
          </h3>

          {/* Table Container */}
          <div className="rounded-custom border border-dark-border bg-dark-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-border bg-black/60">
                    <th className="px-5 py-4 text-[10px] uppercase font-mono tracking-wider text-gray-400">Competitor</th>
                    <th className="px-5 py-4 text-[10px] uppercase font-mono tracking-wider text-gray-400">Core Strengths</th>
                    <th className="px-5 py-4 text-[10px] uppercase font-mono tracking-wider text-gray-400">Core Weaknesses</th>
                    <th className="px-5 py-4 text-[10px] uppercase font-mono tracking-wider text-gray-400">Pricing Model</th>
                    <th className="px-5 py-4 text-[10px] uppercase font-mono tracking-wider text-gray-400">Market Gaps Exploit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/60">
                  {competitorData.competitors?.map((comp: Competitor, i: number) => (
                    <tr key={i} className="hover:bg-dark-border/20 transition-colors">
                      {/* Name */}
                      <td className="px-5 py-5 text-xs font-semibold text-white align-top">
                        {comp.name}
                      </td>

                      {/* Strengths */}
                      <td className="px-5 py-5 text-xs text-gray-300 align-top">
                        <ul className="space-y-1">
                          {comp.strengths?.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-emerald-500 shrink-0">+</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* Weaknesses */}
                      <td className="px-5 py-5 text-xs text-gray-300 align-top">
                        <ul className="space-y-1">
                          {comp.weaknesses?.map((weak, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-red-500 shrink-0">-</span>
                              <span>{weak}</span>
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* Pricing */}
                      <td className="px-5 py-5 text-xs text-gray-300 align-top font-mono">
                        {comp.pricing}
                      </td>

                      {/* Market Gaps */}
                      <td className="px-5 py-5 text-xs text-gold align-top">
                        <ul className="space-y-1">
                          {comp.marketGaps?.map((gap, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="shrink-0">•</span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-custom border border-dark-border bg-dark-card p-5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Co-Founder Tactical Tip</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Use your competitor's weaknesses to write copy for your landing page. For example, if competitors require high annual contract sizes, highlight <strong className="text-white font-bold">"Self-serve, cancel anytime subscription"</strong> in your main headings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
