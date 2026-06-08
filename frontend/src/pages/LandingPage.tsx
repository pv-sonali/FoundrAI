import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Play
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [demoOpen, setDemoOpen] = useState(false);

  const handleStartBuilding = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const featureCards = [
    { title: 'AI Idea Validation', desc: 'Runs instant SWOT audits and feasibility risk assessment scorecards.' },
    { title: 'Market Research', desc: 'Estimates TAM, SAM, and SOM figures with detailed local growth trends.' },
    { title: 'Competitor Analysis', desc: 'Constructs structured competitor grids revealing unmet market gaps.' },
    { title: 'MVP Planner', desc: 'Prioritizes specifications and populates task roadmaps onto Kanban sprint boards.' },
    { title: 'Pitch Deck Generator', desc: 'Drafts investor slide text blocks and exports directly to clean PDF/printouts.' },
    { title: 'Funding Finder', desc: 'Matches startups with geographical non-dilutive grants, incubators, and angel groups.' },
    { title: 'Startup Mentor Chat', desc: 'Dialogues with a specialized virtual co-founder utilizing speech-to-text voice controls.' },
    { title: 'Risk Assessment', desc: 'Evaluates legal, technical, and capital threats with structured action steps.' },
  ];

  const workflowSteps = [
    { num: '01', step: 'Idea', desc: 'Input startup elevator pitch.' },
    { num: '02', step: 'Validation', desc: 'Analyze SWOT quadrants.' },
    { num: '03', step: 'Research', desc: 'Derive TAM/SAM/SOM charts.' },
    { num: '04', step: 'Planning', desc: 'Populate Kanban board specs.' },
    { num: '05', step: 'Funding', desc: 'Apply to matching grants.' },
    { num: '06', step: 'Launch', desc: 'Deploy pitch slide outlines.' },
  ];

  const testimonials = [
    {
      quote: "FoundrAI saved us weeks of consultant fees. We generated our Business Canvas and mapped out our MVP backlog in one afternoon. Raised a $200k SAFE note using the Pitch outline.",
      author: "Sarah Jenkins",
      role: "CTO, Lexicon Health (YC W26)"
    },
    {
      quote: "The TAM/SOM calculators are incredibly robust. Being able to export the deck outline directly to PDF printouts made pitching to angel syndicates extremely smooth.",
      author: "David Chen",
      role: "Founder, NovaCloud Solutions"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white select-none relative font-sans overflow-x-hidden">
      
      {/* Top Navbar */}
      <header className="h-16 border-b border-dark-border px-8 flex justify-between items-center max-w-7xl mx-auto bg-black/90 backdrop-blur-xs fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <span className="font-bold tracking-wider font-mono">FOUNDR<span className="text-gold">AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-4 py-2 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-4 py-2 transition-colors"
              >
                Start Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8 text-center max-w-4xl mx-auto space-y-6">
        <span className="text-[10px] border border-gold/40 text-gold bg-gold/5 px-2.5 py-1 rounded-full uppercase tracking-widest font-mono">
          AI-POWERED VIRTUAL CO-FOUNDER
        </span>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Your AI Co-Founder From <span className="text-gold">Idea to Launch</span>
        </h1>
        
        <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Validate ideas, analyze markets, build MVPs, generate pitch decks, and launch faster with AI.
        </p>

        <div className="flex justify-center items-center gap-4 pt-4">
          <button
            onClick={handleStartBuilding}
            className="flex items-center gap-2 rounded-custom bg-gold hover:bg-gold-hover text-black font-bold text-xs px-6 py-3.5 transition-colors cursor-pointer"
          >
            Start Building <ArrowRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setDemoOpen(true)}
            className="flex items-center gap-2 rounded-custom border border-dark-border hover:border-gold/50 bg-dark-card hover:bg-dark-border text-white text-xs px-6 py-3.5 transition-colors cursor-pointer"
          >
            <Play className="h-4.5 w-4.5 text-gold fill-gold" /> Watch Demo
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 border-t border-dark-border max-w-6xl mx-auto px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Full-Stack Incubation Suite</h2>
          <p className="text-xs text-gray-500">Every module is fine-tuned to mirror YC advisor workflows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((feat) => (
            <div key={feat.title} className="rounded-custom border border-dark-border bg-dark-card p-5 space-y-2 hover:border-gold/30 transition-all">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{feat.title}</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Flowchart */}
      <section className="py-20 border-t border-dark-border bg-black max-w-6xl mx-auto px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Linear Venture Path</h2>
          <p className="text-xs text-gray-500">Take your idea from validation to capital backing in a single interface.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {workflowSteps.map((step, idx) => (
            <div key={step.step} className="rounded-custom border border-dark-border bg-dark-card p-4 text-center space-y-2 relative">
              <div className="text-lg font-bold font-mono text-gold/30">{step.num}</div>
              <h4 className="text-xs font-bold text-white font-mono">{step.step}</h4>
              <p className="text-[10px] text-gray-500 leading-normal">{step.desc}</p>
              {idx < 5 && (
                <div className="hidden md:block absolute top-1/2 -right-3.5 transform -translate-y-1/2 z-20 text-gold text-xs font-mono">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-dark-border max-w-4xl mx-auto px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Backed by Founders</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-custom border border-dark-border bg-dark-card p-6 space-y-4">
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "{t.quote}"
              </p>
              <div>
                <h4 className="text-xs font-bold text-white">{t.author}</h4>
                <span className="text-[10px] text-gold font-mono">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Models */}
      <section className="py-20 border-t border-dark-border max-w-5xl mx-auto px-8 space-y-12 pb-32">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Structured Pricing</h2>
          <p className="text-xs text-gray-500">Pick a scaling model that fits your fundraising stage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="rounded-custom border border-dark-border bg-dark-card p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Free Starter</h4>
                <div className="text-2xl font-bold font-mono mt-2">$0</div>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-gold shrink-0" /> 20 AI Credits</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-gold shrink-0" /> 1 Startup Workspace</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-gold shrink-0" /> Basic SWOT Analysis</li>
              </ul>
            </div>
            <button
              onClick={handleStartBuilding}
              className="w-full text-center rounded-custom border border-dark-border hover:border-gold/50 bg-black text-xs py-2.5 font-bold transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Pro Tier (Highlight) */}
          <div className="rounded-custom border-2 border-gold bg-dark-card p-6 flex flex-col justify-between space-y-6 relative transform scale-105">
            <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-[9px] border border-gold bg-black text-gold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono font-bold">
              Most Popular
            </span>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gold uppercase tracking-widest font-mono">Founder Pro</h4>
                <div className="text-2xl font-bold font-mono mt-2">$29<span className="text-xs font-normal text-gray-500">/mo</span></div>
              </div>
              <ul className="space-y-2.5 text-xs text-white">
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-gold shrink-0" /> Unlimited AI Generations</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-gold shrink-0" /> Multiple Startups</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-gold shrink-0" /> TAM/SOM Projections Chart</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-gold shrink-0" /> Interactive Kanban MVP Board</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-gold shrink-0" /> Pitch Deck Slides PDF Export</li>
              </ul>
            </div>
            <button
              onClick={handleStartBuilding}
              className="w-full text-center rounded-custom bg-gold hover:bg-gold-hover text-black font-bold text-xs py-2.5 transition-colors cursor-pointer"
            >
              Build Pro Workspace
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="rounded-custom border border-dark-border bg-dark-card p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Enterprise</h4>
                <div className="text-2xl font-bold font-mono mt-2">$149<span className="text-xs font-normal text-gray-500">/mo</span></div>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-gold shrink-0" /> Everything in Pro</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-gold shrink-0" /> Collaborator Invites</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-gold shrink-0" /> Custom AI endpoint Keys</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-gold shrink-0" /> White-label deck branding</li>
              </ul>
            </div>
            <button
              onClick={handleStartBuilding}
              className="w-full text-center rounded-custom border border-dark-border hover:border-gold/50 bg-black text-xs py-2.5 font-bold transition-colors cursor-pointer"
            >
              Contact Scale
            </button>
          </div>
        </div>
      </section>

      {/* Demo Modal Overlay */}
      {demoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-lg rounded-custom border border-dark-border bg-dark-card p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-dark-border pb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">FoundrAI Interactive Demo</h4>
              <button onClick={() => setDemoOpen(false)} className="text-xs text-gray-500 hover:text-white font-bold">Close</button>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              FoundrAI packages all validation, modeling, mapping, roadmap scheduling, slide exports, and non-dilutive match-finding in one interface.
            </p>
            <div className="border border-dark-border bg-black rounded-custom p-4 space-y-3.5 text-xs">
              <div className="flex gap-2.5"><span className="text-gold font-bold">1.</span> <span>Add your startup details in **My Startups**.</span></div>
              <div className="flex gap-2.5"><span className="text-gold font-bold">2.</span> <span>Run **Idea Validation** for SWOT and co-founder action cards.</span></div>
              <div className="flex gap-2.5"><span className="text-gold font-bold">3.</span> <span>Perform **Market Research** to render TAM/SOM Recharts.</span></div>
              <div className="flex gap-2.5"><span className="text-gold font-bold">4.</span> <span>Configure **MVP Sprints** and check off roadmap tasks.</span></div>
            </div>
            <button
              onClick={() => {
                setDemoOpen(false);
                handleStartBuilding();
              }}
              className="w-full text-center rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs py-2.5 transition-colors cursor-pointer"
            >
              Sign Up & Try Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
