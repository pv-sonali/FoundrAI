import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartupStore } from '../store/startupStore';
import { useAuthStore } from '../store/authStore';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  KanbanSquare,
  Briefcase,
  Compass
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeStartup, activeModules, loadingModules } = useStartupStore();

  const mockFeed = [
    { text: 'Initial checklist created for the workspace', time: 'Just now' },
    { text: 'Platform templates seeded successfully', time: '1 hour ago' },
    { text: 'AI credits loaded into dashboard subscription wallet', time: '2 hours ago' },
  ];

  // Dynamic onboarding Checklist
  const checklist = [
    {
      title: 'Define Startup Profile & Target Segment',
      desc: 'Set name, elevator pitch, target group, and category.',
      completed: !!activeStartup,
      path: '/startups',
    },
    {
      title: 'Validate Idea SWOT Factors',
      desc: 'Score feasibility, analyze opportunity, and study risk mitigation suggestion cards.',
      completed: !!activeModules?.idea,
      path: '/idea-validator',
    },
    {
      title: 'Run TAM, SAM, SOM Calculations',
      desc: 'Calculate potential market transaction volumes and analyze industry trends.',
      completed: !!activeModules?.research,
      path: '/market-research',
    },
    {
      title: 'Formulate Business Model Canvas',
      desc: 'Lock in channels, customer segments, pricing loops, and key partners.',
      completed: !!activeModules?.businessModel,
      path: '/business-model',
    },
    {
      title: 'Prioritize MVP Roadmap & Sprint kanban',
      desc: 'Structure must-haves vs future features and sync tasks on the Kanban sprint board.',
      completed: !!activeModules?.mvpPlan,
      path: '/mvp-planner',
    },
    {
      title: 'Outline Investor Pitch Deck Slides',
      desc: 'Draft problem definitions, asks, solutions, and financials for investors.',
      completed: !!activeModules?.pitchDeck,
      path: '/pitch-deck',
    },
  ];

  const completedCount = checklist.filter((item) => item.completed).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in select-none">
      {/* Welcome banner */}
      <div className="border-b border-dark-border pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-gold animate-spin-slow" />
            Founder Cockpit
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Welcome back, {user?.name}. Check your startup onboarding milestones and action logs below.
          </p>
        </div>
        {activeStartup && (
          <div className="text-[10px] font-mono text-gray-500 bg-dark-card border border-dark-border rounded-md px-2.5 py-1">
            Startup: <span className="text-gold font-bold">{activeStartup.name}</span>
          </div>
        )}
      </div>

      {loadingModules ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-gold"></div>
        </div>
      ) : !activeStartup ? (
        <div className="rounded-custom border border-dark-border bg-dark-card p-12 text-center">
          <Briefcase className="h-10 w-10 text-gold/40 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">No Active Startup Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            Please create or select a startup workspace to launch your venture dashboard.
          </p>
          <button
            onClick={() => navigate('/startups')}
            className="rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-5 py-2.5 transition-colors cursor-pointer"
          >
            Launch Startup Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Setup Progress Checklist & Modules */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress stats card */}
            <div className="rounded-custom border border-dark-border bg-dark-card p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Venture Setup Progress
                </h3>
                <span className="text-[10px] font-mono text-gold">
                  {completedCount} of 6 tasks ({Math.round((completedCount / 6) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-black rounded-full h-1.5 overflow-hidden border border-dark-border">
                <div 
                  className="bg-gold h-full transition-all duration-500" 
                  style={{ width: `${(completedCount / 6) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.title}
                  onClick={() => navigate(item.path)}
                  className={`rounded-custom border p-4.5 flex items-start gap-3.5 cursor-pointer transition-colors ${
                    item.completed ? 'border-dark-border bg-dark-card/45 opacity-80' : 'border-dark-border bg-dark-card hover:bg-dark-border/20'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-gold" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-600 hover:text-gold transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className={`text-xs font-bold ${item.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gold/80 hover:text-white flex items-center gap-0.5 font-semibold">
                        Launch <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Quick stats & Activity Feed */}
          <div className="space-y-6">
            
            {/* Quick module stats */}
            <div className="rounded-custom border border-dark-border bg-dark-card p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-dark-border/40 pb-2">
                Workspace Health Score
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="border border-dark-border bg-black rounded-custom p-3 flex flex-col items-center">
                  <Sparkles className="h-4.5 w-4.5 text-gold mb-1" />
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">Idea Validation</span>
                  <span className="text-sm font-bold text-white mt-1">
                    {activeModules?.idea ? `${activeModules.idea.score}/100` : '—'}
                  </span>
                </div>

                <div className="border border-dark-border bg-black rounded-custom p-3 flex flex-col items-center">
                  <TrendingUp className="h-4.5 w-4.5 text-gold mb-1" />
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">Market TAM</span>
                  <span className="text-sm font-bold text-white mt-1 truncate max-w-full">
                    {activeModules?.research ? `$${(activeModules.research.tam / 1000000000).toFixed(1)}B` : '—'}
                  </span>
                </div>

                <div className="border border-dark-border bg-black rounded-custom p-3 flex flex-col items-center">
                  <KanbanSquare className="h-4.5 w-4.5 text-gold mb-1" />
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">MVP Sprint</span>
                  <span className="text-xs font-bold text-white mt-1">
                    {activeModules?.mvpPlan ? `${activeModules.mvpPlan.sprintPlan.length} Tasks` : '—'}
                  </span>
                </div>

                <div className="border border-dark-border bg-black rounded-custom p-3 flex flex-col items-center">
                  <MessageSquare className="h-4.5 w-4.5 text-gold mb-1" />
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-mono">Mentor Chats</span>
                  <span className="text-xs font-bold text-white mt-1">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* User Activity Feed */}
            <div className="rounded-custom border border-dark-border bg-dark-card p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-dark-border/40 pb-2">
                Workspace Log Activity
              </h3>
              <div className="space-y-4 max-h-48 overflow-y-auto">
                {mockFeed.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold mt-1.5 shrink-0"></span>
                    <div>
                      <div className="text-xs text-gray-300 leading-normal">{item.text}</div>
                      <span className="text-[9px] text-gray-600 font-mono mt-0.5 block">{item.time}</span>
                    </div>
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
