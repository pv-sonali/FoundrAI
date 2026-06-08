import React, { useState } from 'react';
import { useStartupStore } from '../store/startupStore';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';
import { Sparkles, Check, AlertCircle, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';

export const IdeaValidator: React.FC = () => {
  const { setCredits } = useAuthStore();
  const { activeStartup, activeModules, setActiveModules } = useStartupStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ideaData = activeModules?.idea;

  const handleValidate = async () => {
    if (!activeStartup) return;
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/ai/validate', {
        method: 'POST',
        body: { startupId: activeStartup._id },
      });

      if (res.success) {
        // Update credits
        if (res.userCredits !== undefined) {
          setCredits(res.userCredits);
        }
        // Update store modules
        setActiveModules({
          ...activeModules,
          idea: res.idea,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Validation failed.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-950 bg-emerald-950/10';
    if (score >= 60) return 'text-gold border-gold/40 bg-gold/5';
    return 'text-red-400 border-red-950 bg-red-950/10';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Highly Viable';
    if (score >= 70) return 'Good Potential';
    if (score >= 50) return 'Needs Pivot';
    return 'High Friction';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-dark-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            AI Idea Validator
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Analyze validation scores, identify market frictions, SWOT profiles, and early risks.
          </p>
        </div>
        {activeStartup && (
          <button
            onClick={handleValidate}
            disabled={loading}
            className="flex items-center gap-2 rounded-custom bg-gold hover:bg-gold-hover disabled:bg-dark-border text-black disabled:text-gray-500 font-semibold text-xs px-4 py-2 transition-colors cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : ideaData ? (
              'Re-Validate Idea'
            ) : (
              'Run AI Validation'
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {!ideaData && !loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-12 text-center">
          <Sparkles className="h-10 w-10 text-gold/40 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">No Validation Data Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            Generate validation reports for **{activeStartup?.name}** using the centralized AI service.
          </p>
          <button
            onClick={handleValidate}
            className="rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-5 py-2.5 transition-colors cursor-pointer"
          >
            Run Idea Validator (Uses 1 Credit)
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-20 text-center">
          <RefreshCw className="h-10 w-10 text-gold animate-spin mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">Analyzing Startup Pitch</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Our virtual YC mentor is scoring your market opportunity and compiling SWOT quadrants...
          </p>
        </div>
      )}

      {ideaData && !loading && (
        <div className="space-y-8">
          {/* Top Scorecard & Market Opportunity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scorecard */}
            <div className={`rounded-custom border p-6 flex flex-col justify-center items-center text-center ${getScoreColor(ideaData.score)}`}>
              <div className="text-[10px] uppercase tracking-widest font-mono text-gray-400 mb-2">
                Validation Score
              </div>
              <div className="text-5xl font-extrabold tracking-tight font-mono text-white">
                {ideaData.score}
                <span className="text-lg font-normal text-gray-500">/100</span>
              </div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-wider">
                {getScoreLabel(ideaData.score)}
              </div>
            </div>

            {/* Market Opportunity */}
            <div className="md:col-span-2 rounded-custom border border-dark-border bg-dark-card p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-gold" />
                Market Opportunity
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {ideaData.marketOpportunity}
              </p>
            </div>
          </div>

          {/* SWOT Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              SWOT Quadrants
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="rounded-custom border border-dark-border bg-dark-card p-5">
                <div className="text-xs font-semibold text-emerald-400 mb-3 uppercase tracking-wider font-mono">
                  S • Strengths
                </div>
                <ul className="space-y-2">
                  {ideaData.swot?.strengths?.map((str: string, i: number) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="rounded-custom border border-dark-border bg-dark-card p-5">
                <div className="text-xs font-semibold text-amber-400 mb-3 uppercase tracking-wider font-mono">
                  W • Weaknesses
                </div>
                <ul className="space-y-2">
                  {ideaData.swot?.weaknesses?.map((wk: string, i: number) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="rounded-custom border border-dark-border bg-dark-card p-5">
                <div className="text-xs font-semibold text-indigo-400 mb-3 uppercase tracking-wider font-mono">
                  O • Opportunities
                </div>
                <ul className="space-y-2">
                  {ideaData.swot?.opportunities?.map((op: string, i: number) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{op}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Threats */}
              <div className="rounded-custom border border-dark-border bg-dark-card p-5">
                <div className="text-xs font-semibold text-rose-400 mb-3 uppercase tracking-wider font-mono">
                  T • Threats
                </div>
                <ul className="space-y-2">
                  {ideaData.swot?.threats?.map((th: string, i: number) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{th}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Risks & Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risks */}
            <div className="rounded-custom border border-dark-border bg-dark-card p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Identified Risk Factors
              </h3>
              <ul className="space-y-3.5">
                {ideaData.risks?.map((risk: string, i: number) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 mt-1.5"></span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="rounded-custom border border-dark-border bg-dark-card p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-gold" />
                Co-Founder Action Plan
              </h3>
              <ul className="space-y-3.5">
                {ideaData.suggestions?.map((sug: string, i: number) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0 mt-1.5"></span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
