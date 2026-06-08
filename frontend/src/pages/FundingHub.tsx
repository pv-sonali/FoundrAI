import React, { useState } from 'react';
import { useStartupStore } from '../store/startupStore';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';
import { RefreshCw, DollarSign, Award, Target, Landmark } from 'lucide-react';

export const FundingHub: React.FC = () => {
  const { setCredits } = useAuthStore();
  const { activeStartup, activeModules, setActiveModules } = useStartupStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fundingData = activeModules?.funding;

  const handleGenerate = async () => {
    if (!activeStartup) return;
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/ai/funding', {
        method: 'POST',
        body: { startupId: activeStartup._id },
      });

      if (res.success) {
        if (res.userCredits !== undefined) {
          setCredits(res.userCredits);
        }
        setActiveModules({
          ...activeModules,
          funding: res.funding,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Search failed.');
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
            <DollarSign className="h-5 w-5 text-gold" />
            Funding Recommendation Hub
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Discover non-dilutive government grants, top seed accelerators, angel groups, and early-stage VCs.
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
            ) : fundingData ? (
              'Search Matches Again'
            ) : (
              'Find Funding Options'
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {!fundingData && !loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-12 text-center">
          <DollarSign className="h-10 w-10 text-gold/40 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">No Funding Matches Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            Find government grants, angels, and seed VC funds matching the <strong className="text-white font-bold">{activeStartup?.name}</strong> profile.
          </p>
          <button
            onClick={handleGenerate}
            className="rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-5 py-2.5 transition-colors cursor-pointer"
          >
            Match Funding Options (Uses 1 Credit)
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-20 text-center">
          <RefreshCw className="h-10 w-10 text-gold animate-spin mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">Matching Funding Databases</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Analyzing geographical grants lists, tracking recent VC investment fields, and sorting seed accelerators...
          </p>
        </div>
      )}

      {fundingData && !loading && (
        <div className="space-y-8">
          {/* Section 1: Non-Dilutive Government Grants */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5 border-b border-dark-border/40 pb-2">
              <Landmark className="h-4 w-4 text-gold" />
              Non-Dilutive Grants
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fundingData.grants?.map((grant: any, i: number) => (
                <div key={i} className="rounded-custom border border-dark-border bg-dark-card p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-white leading-normal">{grant.name}</h4>
                      <span className="text-[10px] font-bold text-gold font-mono border border-gold/40 bg-gold/5 px-2 py-0.5 rounded-sm shrink-0">
                        {grant.amount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{grant.description}</p>
                  </div>
                  {grant.link && (
                    <a
                      href={grant.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-gold hover:underline"
                    >
                      Application Portal →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Incubators & Accelerators */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5 border-b border-dark-border/40 pb-2">
              <Award className="h-4 w-4 text-gold" />
              Seed Incubators & Accelerators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fundingData.incubators?.map((acc: any, i: number) => (
                <div key={i} className="rounded-custom border border-dark-border bg-dark-card p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-white leading-normal">{acc.name}</h4>
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono shrink-0">
                        {acc.location}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{acc.description}</p>
                  </div>
                  {acc.link && (
                    <a
                      href={acc.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-gold hover:underline"
                    >
                      Apply to Program →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Angels & VCs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Angel Syndicates */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5 border-b border-dark-border/40 pb-2">
                <Target className="h-4 w-4 text-gold" />
                Angel Syndicates
              </h3>
              <div className="space-y-3">
                {fundingData.angelInvestors?.map((angel: any, i: number) => (
                  <div key={i} className="rounded-custom border border-dark-border bg-dark-card p-4 space-y-2">
                    <h4 className="text-xs font-bold text-white">{angel.name}</h4>
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-gray-500">
                      <div>
                        <div className="uppercase text-[8px] tracking-wider text-gray-600">Sectors</div>
                        <span className="text-gray-300 font-sans truncate block">{angel.sector}</span>
                      </div>
                      <div>
                        <div className="uppercase text-[8px] tracking-wider text-gray-600">Ticket</div>
                        <span className="text-gold font-sans">{angel.ticketSize}</span>
                      </div>
                      <div>
                        <div className="uppercase text-[8px] tracking-wider text-gray-600">Location</div>
                        <span className="text-gray-300 font-sans">{angel.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Venture Capital (VC) Funds */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5 border-b border-dark-border/40 pb-2">
                <Target className="h-4 w-4 text-gold" />
                Venture Capital (VC) Funds
              </h3>
              <div className="space-y-3">
                {fundingData.vcs?.map((vc: any, i: number) => (
                  <div key={i} className="rounded-custom border border-dark-border bg-dark-card p-4 flex flex-col justify-between min-h-[96px]">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-white">{vc.name}</h4>
                        <span className="text-[10px] text-gold font-mono">{vc.averageTicket}</span>
                      </div>
                      <p className="text-[11px] text-gray-400">{vc.focus}</p>
                    </div>
                    {vc.link && (
                      <a
                        href={vc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-mono text-gold hover:underline mt-2 inline-block self-start"
                      >
                        Visit Portfolio →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
