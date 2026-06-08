import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Play,
  BrainCircuit,
  LineChart,
  Briefcase,
  Layers,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const NetworkBackground: React.FC = () => {
  useEffect(() => {
    const canvas = document.getElementById('network-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles: { x: number, y: number, vx: number, vy: number, radius: number }[] = [];
    const particleCount = Math.floor(width * height / 12000);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 0.5
      });
    }

    let mouse = { x: -1000, y: -1000 };
    
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY + window.scrollY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let animationFrame: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.fill();

        let dxMouse = mouse.x - p.x;
        let dyMouse = mouse.y - p.y;
        let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 180) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(212, 175, 55, ${0.8 * (1 - distMouse / 180)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let dx = p.x - p2.x;
          let dy = p.y - p2.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.15 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas 
      id="network-canvas" 
      className="absolute inset-0 z-0 pointer-events-none opacity-80"
    />
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [demoOpen, setDemoOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (demoOpen) {
      interval = setInterval(() => {
        setActiveScreen((prev) => (prev + 1) % 5);
      }, 4500);
    } else {
      setActiveScreen(0);
    }
    return () => clearInterval(interval);
  }, [demoOpen]);

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

  const aiAgents = [
    { name: 'Startup Mentor', role: 'Virtual Co-Founder', desc: 'Provides professional, highly actionable, and strategic guidance tailored to your specific startup stage.', icon: <BrainCircuit className="h-5 w-5 text-gold" /> },
    { name: 'Market Analyst', role: 'Elite Researcher', desc: 'Delivers deep, data-driven insights into market sizes (TAM/SAM/SOM), local trends, and competitor gaps.', icon: <LineChart className="h-5 w-5 text-gold" /> },
    { name: 'Business Consultant', role: 'Strategy Expert', desc: 'Excels at structuring lean business models, pinpointing customer segments, and identifying scalable revenue streams.', icon: <Briefcase className="h-5 w-5 text-gold" /> },
    { name: 'Product Manager', role: 'Agile Specialist', desc: 'Translates vague ideas into actionable MVP specifications and orchestrates technical kanban task workflows.', icon: <Layers className="h-5 w-5 text-gold" /> },
    { name: 'Risk & VC Advisor', role: 'Chief Risk Officer', desc: 'Identifies critical threats and structures compelling pitch decks designed to close capital from syndicates.', icon: <ShieldAlert className="h-5 w-5 text-gold" /> },
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
      author: "Ravi Kumar Reddy",
      role: "Creator, Sr Digital Telugu"
    },
    {
      quote: "The TAM/SOM calculators are incredibly robust. Being able to export the deck outline directly to PDF printouts made pitching to angel syndicates extremely smooth.",
      author: "Vickram Kumar",
      role: "Andhra Kreatives"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white select-none relative font-sans overflow-x-hidden">
      
      {/* Top Navbar */}
      <header className="h-16 border-b border-dark-border px-8 flex justify-between items-center max-w-7xl mx-auto bg-black/90 backdrop-blur-xs fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider font-mono text-lg">FOUNDR<span className="text-gold">AI</span></span>
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
      <section className="relative min-h-[calc(100vh-4rem)] mt-16 flex flex-col justify-center items-center px-8 text-center max-w-full overflow-hidden w-full">
        <NetworkBackground />
        
        {/* Radial Gradient overlay to ensure text remains readable */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <span className="text-[10px] border border-gold/40 text-gold bg-gold/5 px-2.5 py-1 rounded-full uppercase tracking-widest font-mono shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            AI-POWERED VIRTUAL CO-FOUNDER
          </span>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your AI Co-Founder From <span className="text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">Idea to Launch</span>
          </h1>
          
          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Validate ideas, analyze markets, build MVPs, generate pitch decks, and launch faster with AI.
          </p>

          <div className="flex justify-center items-center gap-4 pt-4">
            <button
              onClick={handleStartBuilding}
              className="flex items-center gap-2 rounded-custom bg-gold hover:bg-gold-hover text-black font-bold text-xs px-6 py-3.5 transition-colors cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            >
              Start Building <ArrowRight className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setDemoOpen(true)}
              className="flex items-center gap-2 rounded-custom border border-dark-border hover:border-gold/50 bg-black/60 backdrop-blur-md hover:bg-dark-border text-white text-xs px-6 py-3.5 transition-colors cursor-pointer"
            >
              <Play className="h-4.5 w-4.5 text-gold fill-gold" /> Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* AI Agents Showcase */}
      <section className="py-20 border-t border-dark-border bg-black max-w-7xl mx-auto px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Meet Your Elite AI Founding Team</h2>
          <p className="text-xs text-gray-500">5 specialized intelligence personas working 24/7 to scale your vision.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {aiAgents.map((agent) => (
            <div key={agent.name} className="rounded-custom border border-dark-border bg-dark-card p-6 flex flex-col items-center text-center space-y-4 hover:border-gold/30 transition-all group">
              <div className="h-12 w-12 rounded-full border border-dark-border bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                {agent.icon}
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-1">{agent.name}</h3>
                <span className="text-[10px] text-gold font-mono">{agent.role}</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {agent.desc}
              </p>
            </div>
          ))}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-custom border border-dark-border bg-black p-1 space-y-0 shadow-[0_0_50px_rgba(212,175,55,0.1)] relative">
            <div className="bg-dark-card rounded-t-custom p-4 flex justify-between items-center border-b border-dark-border">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              </div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">FoundrAI_Platform_Demo.mp4</h4>
              <button onClick={() => setDemoOpen(false)} className="text-xs text-gray-500 hover:text-white font-bold cursor-pointer">Close</button>
            </div>
            
            {/* Video Player Area */}
            <div className="relative aspect-video bg-gradient-to-br from-black to-gray-900 border-b border-dark-border flex flex-col items-center justify-center p-8 text-center overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold via-black to-black pointer-events-none"></div>
              
              <div className="relative z-10 w-full max-w-lg mx-auto transition-opacity duration-500 ease-in-out h-64 flex items-center justify-center">
                <style>{`
                  @keyframes typing { from { width: 0 } to { width: 100% } }
                  @keyframes blink { 50% { border-color: transparent } }
                  @keyframes slideUp { from { height: 0; opacity: 0 } to { opacity: 1 } }
                  @keyframes slideRight { from { transform: translateX(-20px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
                  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
                  @keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }
                  .custom-typing { animation: typing 3s steps(40, end), blink .75s step-end infinite; overflow: hidden; white-space: nowrap; border-right: 2px solid; }
                  .custom-slide-up { animation: slideUp 1s ease-out forwards; opacity: 0; }
                  .custom-slide-right { animation: slideRight 0.5s ease-out forwards; opacity: 0; }
                  .custom-fade-in { animation: fadeIn 0.5s ease-out forwards; opacity: 0; }
                  .custom-fade-out { animation: fadeOut 0.5s ease-out forwards; }
                  .delay-500 { animation-delay: 0.5s; }
                  .delay-1000 { animation-delay: 1s; }
                  .delay-1500 { animation-delay: 1.5s; }
                  .delay-2000 { animation-delay: 2s; }
                  .delay-2500 { animation-delay: 2.5s; }
                  .delay-3000 { animation-delay: 3s; }
                  .delay-4000 { animation-delay: 4s; }
                `}</style>

                {activeScreen === 0 && (
                  <div className="space-y-4 w-full">
                    <div className="text-center mb-6 custom-fade-in">
                      <Layers className="h-10 w-10 text-gold mx-auto mb-2 animate-bounce" />
                      <h3 className="text-xl font-bold text-white font-mono">1. Workspace Setup</h3>
                    </div>
                    <div className="bg-black/80 border border-dark-border p-4 rounded-custom text-left font-mono text-xs text-green-400 space-y-2 shadow-xl w-full">
                      <p className="custom-typing border-green-400">&gt; Initializing founder environment...</p>
                      <p className="custom-fade-in delay-3000">&gt; Loading Business Model Templates [OK]</p>
                      <p className="custom-fade-in delay-4000">&gt; Connecting to Groq AI Cluster [OK]</p>
                    </div>
                  </div>
                )}
                {activeScreen === 1 && (
                  <div className="space-y-4 w-full">
                    <div className="text-center mb-6 custom-fade-in">
                      <LineChart className="h-10 w-10 text-gold mx-auto mb-2 animate-pulse" />
                      <h3 className="text-xl font-bold text-white font-mono">2. Market Analysis</h3>
                    </div>
                    <div className="flex items-end justify-center gap-4 h-32 border-b border-l border-dark-border p-4 w-full mx-auto max-w-sm">
                      <div className="w-16 bg-gold/40 rounded-t-sm relative custom-slide-up delay-500" style={{ height: '40%' }}>
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-bold">SOM</span>
                      </div>
                      <div className="w-16 bg-gold/70 rounded-t-sm relative custom-slide-up delay-1000" style={{ height: '70%' }}>
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-300 font-bold">SAM</span>
                      </div>
                      <div className="w-16 bg-gold rounded-t-sm relative custom-slide-up delay-1500" style={{ height: '100%' }}>
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white font-bold">TAM</span>
                      </div>
                    </div>
                  </div>
                )}
                {activeScreen === 2 && (
                  <div className="space-y-4 w-full">
                    <div className="text-center mb-6 custom-fade-in">
                      <ShieldAlert className="h-10 w-10 text-gold mx-auto mb-2 animate-pulse" />
                      <h3 className="text-xl font-bold text-white font-mono">3. SWOT & Risk</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-left w-full">
                      <div className="bg-green-950/30 border border-green-900/50 p-4 rounded-custom custom-fade-in delay-500 shadow-lg">
                        <span className="text-green-500 text-xs font-bold block mb-2">Strengths</span>
                        <div className="h-1.5 bg-green-900/50 rounded w-3/4"></div>
                      </div>
                      <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-custom custom-fade-in delay-1000 shadow-lg">
                        <span className="text-red-500 text-xs font-bold block mb-2">Weaknesses</span>
                        <div className="h-1.5 bg-red-900/50 rounded w-1/2"></div>
                      </div>
                      <div className="bg-blue-950/30 border border-blue-900/50 p-4 rounded-custom custom-fade-in delay-1500 shadow-lg">
                        <span className="text-blue-500 text-xs font-bold block mb-2">Opportunities</span>
                        <div className="h-1.5 bg-blue-900/50 rounded w-5/6"></div>
                      </div>
                      <div className="bg-orange-950/30 border border-orange-900/50 p-4 rounded-custom custom-fade-in delay-2000 shadow-lg">
                        <span className="text-orange-500 text-xs font-bold block mb-2">Threats</span>
                        <div className="h-1.5 bg-orange-900/50 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                )}
                {activeScreen === 3 && (
                  <div className="space-y-4 w-full">
                    <div className="text-center mb-6 custom-fade-in">
                      <Briefcase className="h-10 w-10 text-gold mx-auto mb-2 animate-pulse" />
                      <h3 className="text-xl font-bold text-white font-mono">4. MVP Backlog</h3>
                    </div>
                    <div className="flex gap-3 text-left bg-black/80 p-4 rounded-custom border border-dark-border w-full shadow-2xl relative overflow-hidden">
                      <div className="flex-1 space-y-3 relative z-10">
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">To Do</div>
                        <div className="bg-dark-card border border-dark-border h-10 rounded custom-fade-out delay-1500"></div>
                      </div>
                      <div className="flex-1 space-y-3 relative z-10">
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">In Progress</div>
                        <div className="bg-dark-card border border-gold/50 h-10 rounded shadow-[0_0_15px_rgba(212,175,55,0.2)] custom-slide-right delay-1500"></div>
                      </div>
                      <div className="flex-1 space-y-3 relative z-10">
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Done</div>
                        <div className="bg-dark-card border border-dark-border h-10 rounded opacity-50"></div>
                      </div>
                    </div>
                  </div>
                )}
                {activeScreen === 4 && (
                  <div className="space-y-4 w-full">
                    <div className="text-center mb-6 custom-fade-in">
                      <Sparkles className="h-10 w-10 text-gold mx-auto mb-2 animate-spin-slow" />
                      <h3 className="text-xl font-bold text-white font-mono">5. Pitch Deck Export</h3>
                    </div>
                    <div className="flex items-center justify-center gap-6">
                      <div className="bg-white p-4 rounded-md text-left shadow-[0_0_30px_rgba(255,255,255,0.2)] w-40 relative transform -rotate-3 custom-fade-in delay-500">
                        <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                          <FileText className="h-3 w-3" /> PDF
                        </div>
                        <div className="h-3 w-1/3 bg-gray-300 rounded mb-4"></div>
                        <div className="h-2 w-full bg-gray-200 rounded mb-2"></div>
                        <div className="h-2 w-5/6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-2 w-4/6 bg-gray-200 rounded"></div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-md text-left shadow-[0_0_30px_rgba(255,255,255,0.2)] w-40 relative transform rotate-3 custom-fade-in delay-1500">
                        <div className="absolute -top-3 -right-3 bg-orange-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                          <FileText className="h-3 w-3" /> PPTX
                        </div>
                        <div className="h-20 w-full bg-gray-100 border border-gray-200 rounded flex flex-col items-center justify-center p-3">
                          <div className="h-2 w-2/3 bg-gray-300 rounded mb-2"></div>
                          <div className="h-1.5 w-full bg-gray-200 rounded mb-1.5"></div>
                          <div className="h-1.5 w-4/5 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Indicators */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeScreen ? 'w-8 bg-gold' : 'w-2 bg-gray-700'}`}></div>
                ))}
              </div>
            </div>

            <div className="bg-dark-card rounded-b-custom p-4 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <button onClick={() => setActiveScreen(prev => prev === 0 ? 4 : prev - 1)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                   <Play className="h-4 w-4 rotate-180" />
                 </button>
                 <button onClick={() => setActiveScreen(prev => (prev + 1) % 5)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                   <Play className="h-4 w-4" />
                 </button>
                 <span className="text-xs font-mono text-gray-500">00:0{activeScreen + 1} / 00:05</span>
               </div>
              <button
                onClick={() => {
                  setDemoOpen(false);
                  handleStartBuilding();
                }}
                className="rounded-custom bg-gold hover:bg-gold-hover text-black font-bold text-xs px-6 py-2 transition-colors cursor-pointer"
              >
                Try It Free
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="border-t border-dark-border py-8 text-center bg-black">
        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
          &copy; {new Date().getFullYear()} FoundrAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
