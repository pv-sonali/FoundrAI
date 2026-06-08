import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Terminal, Shield, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = [
    { name: 'Go to Dashboard', path: '/dashboard', icon: Compass, category: 'Navigation' },
    { name: 'Idea Validator Module', path: '/idea-validator', icon: Terminal, category: 'AI Tools' },
    { name: 'Market Research Engine', path: '/market-research', icon: Terminal, category: 'AI Tools' },
    { name: 'Competitor Intelligence', path: '/competitor-intelligence', icon: Terminal, category: 'AI Tools' },
    { name: 'Business Model Canvas', path: '/business-model', icon: Terminal, category: 'AI Tools' },
    { name: 'MVP Planner & Kanban', path: '/mvp-planner', icon: Terminal, category: 'Planning' },
    { name: 'Pitch Deck Generator', path: '/pitch-deck', icon: Terminal, category: 'Funding' },
    { name: 'Funding Finder Hub', path: '/funding-hub', icon: Terminal, category: 'Funding' },
    { name: 'AI Startup Mentor Chat', path: '/ai-mentor', icon: Terminal, category: 'Mentorship' },
    { name: 'Risk Analyzer Tool', path: '/risk-analyzer', icon: Terminal, category: 'Planning' },
    { name: 'My Startups Workspace', path: '/startups', icon: Compass, category: 'Navigation' },
    { name: 'Account Settings', path: '/settings', icon: Compass, category: 'Navigation' },
    ...(user?.role === 'admin'
      ? [{ name: 'Admin Panel Cockpit', path: '/admin-panel', icon: Shield, category: 'Admin' }]
      : []),
  ];

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          navigate(filtered[selectedIndex].path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 pt-[15vh] px-4 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg rounded-custom border border-dark-border bg-dark-card shadow-2xl overflow-hidden fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-dark-border px-4 py-3">
          <Search className="mr-3 h-5 w-5 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            placeholder="Type a command or search tools (Esc to close)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
        </div>

        {/* Command Items */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No tools or commands found matching "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.name}
                  className={`flex items-center justify-between rounded-md px-3 py-2.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-gold/15 text-white' : 'text-gray-400 hover:bg-dark-border hover:text-white'
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 ${isSelected ? 'text-gold' : 'text-gray-500'}`} />
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-[10px] text-gray-500 tracking-wider uppercase mt-0.5">{item.category}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-xs text-gold flex items-center gap-1 font-mono">
                      Enter <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex justify-between items-center bg-black/60 border-t border-dark-border px-4 py-2.5 text-[11px] text-gray-500 font-mono">
          <div>Use arrow keys ↑↓ to navigate</div>
          <div>Esc to close</div>
        </div>
      </div>
    </div>
  );
};
