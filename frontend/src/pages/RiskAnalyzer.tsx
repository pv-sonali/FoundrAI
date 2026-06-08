import React, { useState } from 'react';
import { useStartupStore } from '../store/startupStore';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';
import { RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';

export const RiskAnalyzer: React.FC = () => {
  const { setCredits } = useAuthStore();
  const { activeStartup, activeModules, setActiveModules } = useStartupStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const riskData = activeModules?.risk;

  const handleGenerate = async () => {
    if (!activeStartup) return;
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/ai/risk-analysis', {
        method: 'POST',
        body: { startupId: activeStartup._id },
      });

      if (res.success) {
        if (res.userCredits !== undefined) {
          setCredits(res.userCredits);
        }
        setActiveModules({
          ...activeModules,
          risk: res.risk,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-400 border-red-950 bg-red-950/10';
    if (score >= 40) return 'text-gold border-gold/40 bg-gold/5';
    return 'text-emerald-400 border-emerald-950 bg-emerald-950/10';
  };

  const getLevelLabel = (score: number) => {
    if (score >= 70) return 'Critical Risk';
    if (score >= 40) return 'Moderate Risk';
    return 'Managed Risk';
  };

  const renderRiskCard = (title: string, data: any) => {
    if (!data) return null;
    return (
      <div className="rounded-custom border border-dark-border bg-dark-card p-6 space-y-4">
        {/* Score block */}
        <div className="flex justify-between items-center border-b border-dark-border pb-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{title}</h4>
          <div className={`border rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${getScoreColor(data.score)}`}>
            {data.score}/100 • {getLevelLabel(data.score)}
          </div>
        </div>

        {/* Factors */}
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">Vulnerability Factors</div>
          <ul className="space-y-1.5">
            {data.factors?.map((item: string, idx: number) => (
              <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="text-red-500 shrink-0">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mitigations */}
        <div>
          <div className="text-[10px] text-gold uppercase tracking-widest font-mono mb-2">Mitigation Plan</div>
          <ul className="space-y-1.5">
            {data.mitigations?.map((item: string, idx: number) => (
              <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="text-emerald-500 shrink-0">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-dark-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-gold" />
            Risk Assessment Cockpit
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Map out critical vulnerabilities across domains and establish structural co-founder mitigation steps.
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
            ) : riskData ? (
              'Run Audit Re-Assessment'
            ) : (
              'Run Risk Analysis'
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {!riskData && !loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-12 text-center">
          <ShieldAlert className="h-10 w-10 text-gold/40 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">No Risk Analysis Formulated</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            Generate risk scorecards and mitigation blueprints for **{activeStartup?.name}**.
          </p>
          <button
            onClick={handleGenerate}
            className="rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-5 py-2.5 transition-colors cursor-pointer"
          >
            Assess Risk Points (Uses 1 Credit)
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-20 text-center">
          <RefreshCw className="h-10 w-10 text-gold animate-spin mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">Assessing Threat Matrix</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Checking intellectual property boundaries, simulating financial cash outflow runway, and mapping server stress tests...
          </p>
        </div>
      )}

      {riskData && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderRiskCard('Technical Feasibility Risks', riskData.technical)}
            {renderRiskCard('Market Demand Risks', riskData.market)}
            {renderRiskCard('Financial & Capital Risks', riskData.financial)}
            {renderRiskCard('Legal & Compliance Risks', riskData.legal)}
          </div>
        </div>
      )}
    </div>
  );
};
