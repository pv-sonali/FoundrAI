import React, { useState, useEffect, useRef } from 'react';
import { useStartupStore } from '../store/startupStore';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  User,
  History,
  Bookmark,
  RefreshCw,
  Info
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  _id: string;
  title: string;
  messages: ChatMessage[];
  saved: boolean;
  createdAt: string;
}

export const AIMentor: React.FC = () => {
  const { setCredits } = useAuthStore();
  const { activeStartup } = useStartupStore();

  const [chatsList, setChatsList] = useState<ChatSession[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat histories on load
  const loadChats = async () => {
    try {
      const res = await apiRequest('/ai/chats');
      if (res.success) {
        setChatsList(res.chats);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  // Auto scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setListening(true);
      rec.onend = () => setListening(false);
      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setListening(false);
      };
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMsg((prev) => prev + (prev ? ' ' : '') + transcript);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Safari.');
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSelectSession = async (session: ChatSession) => {
    try {
      const res = await apiRequest(`/ai/chats/${session._id}`);
      if (res.success && res.chat) {
        setActiveChat(res.chat);
        setMessages(res.chat.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat session details:', err);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    setLoading(true);
    setInputMsg('');
    setError(null);

    // Optimistically add user bubble
    const tempUserMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await apiRequest('/ai/chat', {
        method: 'POST',
        body: {
          startupId: activeStartup?._id,
          chatId: activeChat?._id,
          message: text,
        },
      });

      if (res.success && res.chat) {
        if (res.userCredits !== undefined) {
          setCredits(res.userCredits);
        }
        setActiveChat(res.chat);
        setMessages(res.chat.messages || []);
        loadChats();
      }
    } catch (err: any) {
      setError(err.message || 'AI Mentor failed to reply.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topicPrompt: string) => {
    handleSend(topicPrompt);
  };

  const startNewChat = () => {
    setActiveChat(null);
    setMessages([]);
    setInputMsg('');
  };

  const handleSaveToggle = async (session: ChatSession) => {
    // Optimistic toggle
    const updated = chatsList.map((c) => (c._id === session._id ? { ...c, saved: !c.saved } : c));
    setChatsList(updated);
    if (activeChat?._id === session._id) {
      setActiveChat({ ...activeChat, saved: !activeChat.saved });
    }

    // Call server update if endpoint is needed (can also be handled in general state)
    // Simply logging/mocking save toggle since it's saved locally
  };

  const prepopulatedTopics = [
    { title: 'Fundraising Pitch', prompt: 'Give me some specific advice on how to raise pre-seed capital. What milestones do VCs look for?' },
    { title: 'Early Marketing', prompt: 'What are the best channels to get my first 100 users for this business type?' },
    { title: 'Co-Founder Equity', prompt: 'How should I divide equity with a new technical co-founder?' },
    { title: 'Product Launch', prompt: 'What features should I cut to ensure I launch a viable MVP in 4 weeks?' },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex border border-dark-border rounded-custom overflow-hidden bg-black select-none fade-in">
      
      {/* Left panel: Saved & Past Chats */}
      <aside className="w-64 border-r border-dark-border bg-black flex flex-col">
        <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-card/30">
          <span className="text-[10px] font-bold text-gray-500 uppercase font-mono tracking-wider flex items-center gap-1">
            <History className="h-3.5 w-3.5" /> Sessions
          </span>
          <button
            onClick={startNewChat}
            className="text-[10px] text-gold hover:underline font-semibold"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chatsList.length === 0 ? (
            <div className="text-[11px] text-gray-600 text-center py-8">
              No previous mentor sessions.
            </div>
          ) : (
            chatsList.map((session) => (
              <div
                key={session._id}
                onClick={() => handleSelectSession(session)}
                className={`w-full text-left rounded-md px-3 py-2.5 text-xs transition-colors cursor-pointer flex justify-between items-center gap-2 group ${
                  activeChat?._id === session._id
                    ? 'bg-gold/10 text-gold font-medium border-l-2 border-gold'
                    : 'text-gray-400 hover:bg-dark-card hover:text-white'
                }`}
              >
                <span className="truncate flex-1">{session.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveToggle(session);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-0.5 rounded-sm hover:bg-dark-border transition-all ${
                    session.saved ? 'opacity-100 text-gold' : 'text-gray-500'
                  }`}
                  title={session.saved ? 'Unsave session' : 'Save session'}
                >
                  <Bookmark className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Right panel: Active Chat Console */}
      <main className="flex-1 flex flex-col justify-between bg-black">
        {/* Active Chat Header */}
        <div className="h-12 border-b border-dark-border flex items-center justify-between px-6 bg-dark-card/30">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              AI Virtual Co-Founder
            </span>
          </div>
          {activeStartup && (
            <span className="text-[10px] text-gray-500 font-mono">
              Context: {activeStartup.name}
            </span>
          )}
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-12">
              <Sparkles className="h-8 w-8 text-gold mb-4" />
              <h2 className="text-sm font-bold text-white mb-2">Speak to your Startup Mentor</h2>
              <p className="text-xs text-gray-500 mb-6">
                Ask questions about customer acquisition, seed decks, funding sizes, or hiring steps. Choose a topic below to initiate advice.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full text-left">
                {prepopulatedTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => handleTopicClick(topic.prompt)}
                    className="rounded-custom border border-dark-border bg-dark-card hover:bg-dark-border/40 p-4 transition-all text-xs text-left cursor-pointer group"
                  >
                    <div className="font-semibold text-white group-hover:text-gold transition-colors">{topic.title}</div>
                    <div className="text-gray-500 text-[10px] truncate mt-1">{topic.prompt}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => {
                const isAI = msg.role === 'assistant';
                return (
                  <div
                    key={i}
                    className={`flex gap-3 max-w-[85%] ${
                      isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 uppercase text-xs font-bold font-mono ${
                      isAI ? 'border-gold bg-black text-gold' : 'border-dark-border bg-dark-card text-white'
                    }`}>
                      {isAI ? 'AI' : <User className="h-4.5 w-4.5" />}
                    </div>
                    
                    <div className={`rounded-custom border p-4 text-xs leading-relaxed ${
                      isAI ? 'border-dark-border bg-dark-card text-gray-200' : 'border-gold/30 bg-gold/5 text-white'
                    }`}>
                      <div className="whitespace-pre-line">{msg.content}</div>
                    </div>
                  </div>
                );
              })}
              
              {loading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="h-8 w-8 rounded-full border border-gold bg-black text-gold text-xs font-bold flex items-center justify-center shrink-0">
                    AI
                  </div>
                  <div className="rounded-custom border border-dark-border bg-dark-card px-4 py-3 flex items-center gap-1 text-xs text-gray-500">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-gold mr-1" />
                    Analyzing strategy...
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="rounded-md border border-red-900 bg-red-950/15 p-3 text-xs text-red-400 mt-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-dark-border bg-black">
          <div className="flex items-center gap-2.5 rounded-custom border border-dark-border bg-dark-card px-4 py-2">
            <input
              type="text"
              className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 outline-none"
              placeholder="Ask for advice (e.g. How to acquire waitlists...)"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              disabled={loading}
            />

            {/* Microphone Voice Input */}
            <button
              onClick={toggleVoiceInput}
              disabled={loading}
              className={`p-1.5 rounded-md hover:bg-dark-border transition-colors ${
                listening ? 'text-gold animate-bounce bg-gold/10' : 'text-gray-500 hover:text-white'
              }`}
              title={listening ? 'Stop speech listening' : 'Start Speech to Text'}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="p-1.5 rounded-md hover:bg-dark-border text-gold hover:text-white transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

      </main>

    </div>
  );
};
