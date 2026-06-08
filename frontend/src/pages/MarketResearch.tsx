import React, { useState } from 'react';
import { useStartupStore } from '../store/startupStore';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, TrendingUp, RefreshCw, BarChart2, AlertCircle } from 'lucide-react';

export const MarketResearch: React.FC = () => {
  const { setCredits } = useAuthStore();
  const { activeStartup, activeModules, setActiveModules } = useStartupStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const researchData = activeModules?.research;

  const handleGenerate = async () => {
    if (!activeStartup) return;
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/ai/research', {
        method: 'POST',
        body: { startupId: activeStartup._id },
      });

      if (res.success) {
        if (res.userCredits !== undefined) {
          setCredits(res.userCredits);
        }
        setActiveModules({
          ...activeModules,
          research: res.research,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (val: number) => {
    if (val >= 1000000000) return `$${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  const getChartData = () => {
    if (!researchData) return [];
    return [
      { name: 'TAM', value: researchData.tam, display: formatUSD(researchData.tam), label: 'Total Addressable Market' },
      { name: 'SAM', value: researchData.sam, display: formatUSD(researchData.sam), label: 'Serviceable Addressable Market' },
      { name: 'SOM', value: researchData.som, display: formatUSD(researchData.som), label: 'Serviceable Obtainable Market' },
    ];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-dark-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-gold" />
            Market Research Engine
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Calculate TAM, SAM, and SOM figures with AI estimation models and analyze user pain points.
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
            ) : researchData ? (
              'Recalculate Market Sizes'
            ) : (
              'Generate Market Analysis'
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {!researchData && !loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-12 text-center">
          <BarChart2 className="h-10 w-10 text-gold/40 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">No Market Research Conducted</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            Run market size projections and customer trend analyses for **{activeStartup?.name}**.
          </p>
          <button
            onClick={handleGenerate}
            className="rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-5 py-2.5 transition-colors cursor-pointer"
          >
            Run Market Research (Uses 1 Credit)
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-20 text-center">
          <RefreshCw className="h-10 w-10 text-gold animate-spin mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">Analyzing Industry Dimensions</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Estimating transaction volumes, counting addressable user segments, and outlining macro industry trends...
          </p>
        </div>
      )}

      {researchData && !loading && (
        <div className="space-y-8">
          {/* Market Size Metrics & Recharts Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Indicators */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Market Dimension Projections
              </h3>
              
              <div className="rounded-custom border border-dark-border bg-dark-card p-4 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-mono">TAM (Total Addressable Market)</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Total global market demand</div>
                </div>
                <div className="text-xl font-bold font-mono text-white">{formatUSD(researchData.tam)}</div>
              </div>

              <div className="rounded-custom border border-dark-border bg-dark-card p-4 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-mono">SAM (Serviceable Addressable Market)</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Segment reachable via our products</div>
                </div>
                <div className="text-xl font-bold font-mono text-gold">{formatUSD(researchData.sam)}</div>
              </div>

              <div className="rounded-custom border border-dark-border bg-dark-card p-4 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-mono">SOM (Serviceable Obtainable Market)</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Target capture in next 3 years</div>
                </div>
                <div className="text-xl font-bold font-mono text-white">{formatUSD(researchData.som)}</div>
              </div>
            </div>

            {/* Recharts Bar */}
            <div className="rounded-custom border border-dark-border bg-dark-card p-6 flex flex-col justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                Market Share Proportions
              </h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#555555" fontSize={11} tickLine={false} />
                    <YAxis stroke="#555555" fontSize={10} tickFormatter={(v) => formatUSD(v)} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111111', borderColor: '#222222', borderRadius: '8px' }}
                      labelStyle={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '11px' }}
                      itemStyle={{ color: '#ffffff', fontSize: '11px' }}
                      formatter={(value: any) => [formatUSD(value as number), 'Estimated Size']}
                    />
                    <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Derivation Explanation */}
          <div className="rounded-custom border border-dark-border bg-dark-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-gold" />
              Projections Methodology
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {researchData.explanation}
            </p>
          </div>

          {/* Trends, Pain Points, and Growth Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trends */}
            <div className="rounded-custom border border-dark-border bg-dark-card p-5">
              <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-gold" />
                Industry Trends
              </h4>
              <ul className="space-y-3.5">
                {researchData.trends?.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pain Points */}
            <div className="rounded-custom border border-dark-border bg-dark-card p-5">
              <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-gold" />
                User Pain Points
              </h4>
              <ul className="space-y-3.5">
                {researchData.painPoints?.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth Opportunities */}
            <div className="rounded-custom border border-dark-border bg-dark-card p-5">
              <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                Growth Opportunities
              </h4>
              <ul className="space-y-3.5">
                {researchData.growthOpportunities?.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                    <span>{item}</span>
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
