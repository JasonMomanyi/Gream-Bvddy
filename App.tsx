import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateGeminiResponse } from './services/geminiService';
import { MemoryStore } from './services/memoryStore';
import { Message, IntelligenceMode, ProcessingState } from './types';
import { IconSearch, IconSparkles, IconSend, IconDatabase, IconEdit, IconGreamSkull } from './components/Icons';
import { MemoryManager } from './components/MemoryManager';
import { TrainModal } from './components/TrainModal';

export default function App() {
  // Routing Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const isMemoryOpen = location.pathname === '/memory';

  // State
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<IntelligenceMode>(IntelligenceMode.SUMMARY);
  const [processing, setProcessing] = useState<ProcessingState>('idle');
  const [memoryCount, setMemoryCount] = useState(0);
  
  // Modals
  const [trainData, setTrainData] = useState<{ show: boolean, trigger: string }>({ show: false, trigger: '' });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const refreshMemoryCount = () => {
    setMemoryCount(MemoryStore.load().length);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, processing]);

  // Refresh memory count on mount and when route changes (e.g. closing memory manager)
  useEffect(() => {
    refreshMemoryCount();
  }, [location.pathname]);

  // Handlers
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      mode: mode
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setProcessing('thinking');

    try {
      // 1. Check Local Memory First
      const memoryMatch = MemoryStore.findMatch(currentInput);
      
      if (memoryMatch) {
        setProcessing('idle');
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'model',
          content: memoryMatch.response,
          timestamp: Date.now(),
          mode: mode,
          isTrainedResponse: true
        }]);
        return;
      }

      // 2. Fallback to Gemini with Grounding
      const history = messages.map(m => ({ role: m.role, content: m.content })).slice(-5); // Keep last 5 for context
      
      if (mode !== IntelligenceMode.HALLUCIN) {
        setProcessing('searching');
      }

      const result = await generateGeminiResponse(currentInput, mode, history);

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        content: result.text,
        timestamp: Date.now(),
        mode: mode,
        sources: result.sources
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        content: "I encountered an error connecting to the intelligence network. Please check your API Key.",
        timestamp: Date.now()
      }]);
    } finally {
      setProcessing('idle');
    }
  };

  // Renderers
  const renderModeButton = (m: IntelligenceMode, label: string, colorClass: string, tooltip: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      title={tooltip}
      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
        mode === m 
          ? `${colorClass} text-white border-transparent shadow-lg transform scale-105` 
          : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${mode === IntelligenceMode.HALLUCIN ? 'hallucin-mode-bg' : 'bg-slate-900'}`}>
      
      {/* Header */}
      <header className="flex-none h-16 border-b border-white/10 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2" title="Gream Bvddy - Personal AI Research Assistant">
          {/* Main App Icon: Happy Green Skull with Gemini Star */}
          <IconGreamSkull className="text-green-400 w-8 h-8" />
          <h1 className="text-lg font-bold tracking-tight text-white">Gream Bvddy <span className="text-xs font-normal text-slate-400 ml-2 border border-slate-700 px-2 py-0.5 rounded">v1.0</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate('/memory')}
             title="Manage trained commands and memory"
             className="relative text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm font-medium group"
           >
             <div className="relative">
               <IconDatabase className="w-4 h-4" />
               {memoryCount > 0 && (
                 <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                 </span>
               )}
             </div>
             Memory
             {memoryCount > 0 && (
               <span className="bg-slate-800 text-slate-200 text-[10px] px-1.5 py-0.5 rounded-md border border-slate-700 group-hover:border-cyan-500/50 transition-colors">
                 {memoryCount}
               </span>
             )}
           </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            {/* Splash Icon */}
            <IconGreamSkull className="w-20 h-20 mb-4 text-green-500/80" />
            <h2 className="text-2xl font-bold text-white mb-2">System Online</h2>
            <p className="max-w-md text-slate-400">Select a mode and initiate a query. Gream Bvddy will research, process, and adapt to your needs.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] group relative`}>
              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-slate-700 text-white rounded-br-none' 
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none shadow-lg'
              }`}>
                {/* Header for AI Messages */}
                {msg.role === 'model' && (
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider opacity-60">
                    <span className={msg.isTrainedResponse ? 'text-green-400' : 'text-cyan-400'}>
                      {msg.isTrainedResponse ? 'Memory Recall' : msg.mode}
                    </span>
                    {msg.isTrainedResponse && <IconDatabase className="w-3 h-3 text-green-400" />}
                  </div>
                )}
                
                {/* Content */}
                <div className="prose prose-invert prose-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Grounding Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                      <IconSearch className="w-3 h-3" /> SOURCES
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, idx) => (
                        <a 
                          key={idx} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title={`Open source: ${source.title}`}
                          className="text-xs bg-slate-900 hover:bg-cyan-900/30 text-cyan-400 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 px-2 py-1 rounded transition-colors truncate max-w-[200px]"
                        >
                          {source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Train Action (Only for User messages) */}
              {msg.role === 'user' && (
                <button
                  onClick={() => setTrainData({ show: true, trigger: msg.content })}
                  className="absolute -left-8 top-2 text-slate-600 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                  title="Train AI on this command"
                >
                  <IconEdit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {processing !== 'idle' && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 rounded-full px-4 py-2 flex items-center gap-3 border border-slate-700/50">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-mono text-cyan-400 uppercase">
                {processing === 'searching' ? 'Scanning Network...' : 'Processing Intelligence...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="flex-none p-4 md:p-6 bg-slate-900 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Mode Selector */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {renderModeButton(IntelligenceMode.SUMMARY, 'Summary', 'bg-emerald-600', 'Concise overview with bullet points')}
            {renderModeButton(IntelligenceMode.EXPLANATION, 'Explain', 'bg-blue-600', 'Simple analogies for beginners')}
            {renderModeButton(IntelligenceMode.DETAILED, 'Detailed', 'bg-indigo-600', 'Deep technical breakdowns and steps')}
            {renderModeButton(IntelligenceMode.POPULAR, 'Popular', 'bg-orange-600', 'Trending opinions and general consensus')}
            {renderModeButton(IntelligenceMode.HALLUCIN, 'Hallucin / Imagine', 'bg-purple-600', 'Creative and speculative generation')}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="relative group">
            <div className={`absolute -inset-0.5 rounded-lg blur opacity-20 transition duration-1000 group-hover:opacity-50 ${
              mode === IntelligenceMode.HALLUCIN ? 'bg-purple-600' : 'bg-cyan-500'
            }`}></div>
            <div className="relative flex items-center bg-slate-950 rounded-lg border border-slate-700 focus-within:border-slate-500 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={messages.length === 0 ? "Enter a topic to research or a command..." : "Follow up..."}
                className="flex-1 bg-transparent border-none text-white px-4 py-4 focus:ring-0 placeholder-slate-500"
                disabled={processing !== 'idle'}
              />
              <button
                type="submit"
                disabled={!input.trim() || processing !== 'idle'}
                title="Send message"
                className="p-3 mr-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <IconSend />
              </button>
            </div>
          </form>
          
          <div className="flex flex-col items-center gap-2 text-[10px] font-mono text-slate-600">
             <span>
              {mode === IntelligenceMode.HALLUCIN 
                ? "WARNING: Speculative Mode Active. Output may contain generated fiction." 
                : "Standard Intelligence Active. Grounded in search where applicable."}
            </span>
            <div className="flex gap-4 opacity-60 hover:opacity-100 transition-opacity">
              <a href="https://jasonmomanyi.netlify.app" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400" title="Visit Developer Website">Dev: Jason Momanyi</a>
              <a href="https://discord.com/users/1092210946547654730" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400" title="Contact on Discord">Discord</a>
              <a href="https://instagram.com/lord_stunnis" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400" title="Visit Instagram">@lord_stunnis</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Overlays */}
      {isMemoryOpen && (
        <MemoryManager 
          onClose={() => {
            navigate('/');
          }} 
        />
      )}
      {trainData.show && (
        <TrainModal 
          initialTrigger={trainData.trigger} 
          onClose={() => setTrainData({ show: false, trigger: '' })}
          onSuccess={(trigger) => {
             refreshMemoryCount();
             // Optional: Add a system message confirming learning
             setMessages(prev => [...prev, {
               id: crypto.randomUUID(),
               role: 'model',
               content: `I have successfully learned the command "${trigger}". I will now use your custom response for this input.`,
               timestamp: Date.now(),
               isTrainedResponse: true
             }]);
          }}
        />
      )}
    </div>
  );
}