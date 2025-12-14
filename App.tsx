import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateGeminiResponse } from './services/geminiService';
import { generatePuterResponse } from './services/puterService';
import { MemoryStore } from './services/memoryStore';
import { Message, IntelligenceMode, ProcessingState, AIPersona, AVAILABLE_MODELS } from './types';
import { 
  IconSearch, IconSparkles, IconSend, IconDatabase, IconEdit, 
  IconGreamSkull, IconScrape, IconShield, IconCopy, IconRefresh, 
  IconStar, IconDiscord, IconMedia, IconPersonSuitcase, IconBrain, IconNetworkGlobe
} from './components/Icons';
import { MemoryManager } from './components/MemoryManager';
import { TrainModal } from './components/TrainModal';
import { MediaHub } from './components/MediaHub';
import { PresetSelector } from './components/PresetSelector';
import { ModelSelector } from './components/ModelSelector';
import { HackerOverlay } from './components/HackerOverlay';

export default function App() {
  // Routing Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const isMemoryOpen = location.pathname === '/memory';

  // State
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<IntelligenceMode>(IntelligenceMode.SCRAPE_PLANNER);
  const [persona, setPersona] = useState<AIPersona>('default');
  const [currentModelId, setCurrentModelId] = useState<string>('gemini-1.5-flash');
  const [processing, setProcessing] = useState<ProcessingState>('idle');
  const [memoryCount, setMemoryCount] = useState(0);
  const [showMediaHub, setShowMediaHub] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  
  // Error handling tips
  const [showModelTip, setShowModelTip] = useState(false);

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

  // Get current model info
  const activeModel = AVAILABLE_MODELS.find(m => m.id === currentModelId) || AVAILABLE_MODELS[0];
  const isBaseAI = activeModel.id === 'gemini-1.5-flash';

  // Suggestions based on Mode
  const getSuggestions = (currentMode: IntelligenceMode) => {
    switch (currentMode) {
      case IntelligenceMode.SCRAPE_PLANNER:
        return [
          "Scrape plan for Amazon product prices",
          "Extract job listings from LinkedIn",
          "Gather real estate data from Zillow",
          "Plan for scraping news headlines"
        ];
      case IntelligenceMode.HACKER:
        return [
          "Explain SQL Injection defense",
          "How does Buffer Overflow work?",
          "Mitigating XSS attacks",
          "History of the Morris Worm"
        ];
      case IntelligenceMode.HALLUCIN:
        return [
          "Imagine a world ruled by cats",
          "Design a city on Mars",
          "What if computers had feelings?",
          "Future of AI in 2050"
        ];
      case IntelligenceMode.DETAILED:
        return [
          "Deep dive into Quantum Computing",
          "How does a Compiler work?",
          "Step-by-step React Hooks guide",
          "Architecture of the Internet"
        ];
      default:
        return [
          "Summarize the history of the Internet",
          "Explain Relativity like I'm 5",
          "What is the popular opinion on EVs?",
          "Who created this AI?"
        ];
    }
  };

  // Helper to parse ugly JSON errors
  const parseErrorMessage = (error: any): string => {
    let msg = error instanceof Error ? error.message : String(error);
    
    // Check for JSON string
    if (msg.includes('{"error":')) {
      try {
        const jsonStart = msg.indexOf('{');
        const jsonStr = msg.slice(jsonStart);
        const parsed = JSON.parse(jsonStr);
        if (parsed.error && parsed.error.message) {
          msg = parsed.error.message;
        }
      } catch (e) {
        if (msg.length > 300) msg = msg.substring(0, 300) + "...";
      }
    }

    if (msg.includes('429') || msg.includes('Quota exceeded') || msg.includes('RESOURCE_EXHAUSTED')) {
      return "capacity_error";
    }
    if (msg.includes('API Key is missing')) {
      return "⚠️ **Configuration Error:** API Key is missing.";
    }
    if (msg.includes('503')) {
      return "busy_error";
    }
    
    return `⚠️ **System Error:** ${msg}`;
  };

  // Handlers
  const handleSendMessage = async (e?: React.FormEvent, suggestion?: string) => {
    if (e) e.preventDefault();
    const textToSend = suggestion || input;
    if (!textToSend.trim()) return;

    // Hide previous tips
    setShowModelTip(false);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
      mode: mode,
      persona: persona,
      modelUsed: activeModel.name
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setProcessing('thinking');

    try {
      // 1. Check Local Memory First
      const memoryMatch = MemoryStore.findMatch(textToSend);
      
      if (memoryMatch) {
        setProcessing('idle');
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'model',
          content: memoryMatch.response,
          timestamp: Date.now(),
          mode: mode,
          persona: persona,
          isTrainedResponse: true,
          modelUsed: 'Memory Bank'
        }]);
        return;
      }

      // 2. Determine Provider (Google or Puter)
      const history = messages.map(m => ({ role: m.role, content: m.content })).slice(-5);
      
      let result;

      if (activeModel.provider === 'google') {
        if (mode !== IntelligenceMode.HALLUCIN) setProcessing('searching');
        result = await generateGeminiResponse(textToSend, mode, history, persona);
      } else {
        // Puter Provider (Claude, GPT, DeepSeek, Grok)
        setProcessing('searching'); // Puter takes a moment usually
        result = await generatePuterResponse(textToSend, activeModel.id, mode, history, persona);
      }

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        content: result.text,
        timestamp: Date.now(),
        mode: mode,
        persona: persona,
        sources: result.sources,
        modelUsed: activeModel.name
      }]);
    } catch (error: any) {
      console.error(error);
      const parsedMsg = parseErrorMessage(error);
      
      let finalErrorMsg = "";
      // Smart Tip Integration
      if (parsedMsg === "capacity_error") {
        finalErrorMsg = `⚠️ **System Overload (${activeModel.name})**\nThis model is currently experiencing high traffic from multiple users.`;
        setShowModelTip(true); // Trigger the UI tip
      } else if (parsedMsg === "busy_error") {
        finalErrorMsg = `⚠️ **Service Busy.**\nThe AI provider is temporarily overloaded.`;
        setShowModelTip(true);
      } else {
        finalErrorMsg = parsedMsg;
      }

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        content: finalErrorMsg,
        timestamp: Date.now()
      }]);
    } finally {
      setProcessing('idle');
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Clear all messages?")) {
      setMessages([]);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Renderers
  const renderModeButton = (m: IntelligenceMode, label: string, colorClass: string, tooltip: string, icon?: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      title={tooltip}
      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1 ${
        mode === m 
          ? `${colorClass} text-white border-transparent shadow-lg transform scale-105` 
          : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${mode === IntelligenceMode.HALLUCIN ? 'hallucin-mode-bg' : 'bg-slate-900'}`}>
      
      {mode === IntelligenceMode.HACKER && <HackerOverlay />}

      {/* Header */}
      <header className="flex-none h-16 border-b border-white/10 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2" title="Gream Bvddy - Personal AI Research Assistant">
          <IconGreamSkull className="text-green-400 w-8 h-8" />
          <h1 className="text-lg font-bold tracking-tight text-white">Gream Bvddy <span className="text-xs font-normal text-slate-400 ml-2 border border-slate-700 px-2 py-0.5 rounded">v1.4</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
           
           {/* Model Selector Button */}
           <button 
             onClick={() => setShowModelSelector(true)}
             className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-900/50 transition-all"
             title="Change AI Model"
           >
             <IconBrain className="w-4 h-4" />
             <span className="hidden sm:inline">{activeModel.name}</span>
           </button>

           <div className="h-6 w-px bg-slate-700 mx-1"></div>

           <button 
             onClick={() => setShowPresetSelector(true)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold hover:shadow-lg hover:scale-105 transition-all ${
               persona !== 'default' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
             }`}
             title="Change AI Persona"
           >
             <IconPersonSuitcase className="w-4 h-4" />
             <span className="hidden sm:inline">
               {persona === 'default' ? 'Presets' : persona.charAt(0).toUpperCase() + persona.slice(1)}
             </span>
           </button>

           <button 
             onClick={() => setShowMediaHub(true)}
             className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold hover:shadow-lg hover:scale-105 transition-all"
           >
             <IconMedia className="w-4 h-4" />
             <span className="hidden sm:inline">Media Hub</span>
           </button>

           {messages.length > 0 && (
             <button
               onClick={handleClearChat}
               title="Clear all messages"
               className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
             >
               <IconRefresh className="w-4 h-4" />
             </button>
           )}
           <button 
             onClick={() => navigate('/memory')}
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
             <span className="hidden sm:inline">Memory</span>
           </button>
        </div>
      </header>

      {/* High Traffic Tip Overlay */}
      {showModelTip && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md bg-slate-800/95 border border-amber-500 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center justify-between gap-4 animate-bounce-custom backdrop-blur-md">
           <div className="flex items-start gap-3">
             <div className="bg-amber-500/20 p-2 rounded-lg">
                <IconSparkles className="w-6 h-6 text-amber-500" />
             </div>
             <div className="flex flex-col">
               <span className="font-bold text-sm text-amber-400">High Traffic Detected</span>
               <span className="text-xs text-slate-300 mt-1 leading-relaxed">
                 The current model ({activeModel.name}) is loaded with multiple users.
               </span>
             </div>
           </div>
           <button 
             onClick={() => { setShowModelTip(false); setShowModelSelector(true); }}
             className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors shadow-lg whitespace-nowrap"
           >
             Switch Model
           </button>
        </div>
      )}

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <IconGreamSkull className="w-20 h-20 mb-4 text-green-500/80" />
            <h2 className="text-2xl font-bold text-white mb-2">System Online</h2>
            {/* UPDATED: Displays 'Base AI' instead of generic model name */}
            <p className="max-w-md text-slate-400 mb-6">
              Running on <strong>{activeModel.name}</strong>. Select a mode and initiate a query.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg w-full px-4">
              {getSuggestions(mode).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(undefined, suggestion)}
                  className="bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-3 text-sm text-slate-300 hover:text-white text-left transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            
            {/* Persistent Tip for new users */}
            <div className="mt-8 text-[10px] text-slate-600 flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
               <IconBrain className="w-3 h-3" />
               <span>Tip: If Base AI is slow, try switching to Claude or GPT in the model selector.</span>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] group relative`}>
              <div className={`p-4 rounded-2xl relative ${
                msg.role === 'user' 
                  ? 'bg-slate-700 text-white rounded-br-none' 
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none shadow-lg pb-8'
              }`}>
                {msg.role === 'model' && (
                  <div className="flex items-center justify-between mb-2 opacity-60">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                      <span className={`flex items-center gap-1 ${msg.isTrainedResponse ? 'text-green-400' : 'text-cyan-400'}`}>
                        {msg.mode === IntelligenceMode.SCRAPE_PLANNER && !msg.isTrainedResponse && <IconScrape className="w-3 h-3" />}
                        {msg.mode === IntelligenceMode.HACKER && !msg.isTrainedResponse && <IconShield className="w-3 h-3" />}
                        {msg.isTrainedResponse 
                          ? 'Memory Recall' 
                          : (msg.persona && msg.persona !== 'default' 
                              ? `${msg.persona.toUpperCase()}` 
                              : msg.mode?.replace('_', ' '))}
                      </span>
                    </div>
                    {/* Show Model Used in Message */}
                    <span className="text-[10px] bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400">
                      {msg.modelUsed || activeModel.name}
                    </span>
                  </div>
                )}
                
                <div className="prose prose-invert prose-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>

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
                
                {msg.role === 'model' && (
                  <button 
                    onClick={() => handleCopy(msg.content)}
                    className="absolute bottom-2 right-2 text-slate-500 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors"
                    title="Copy response"
                  >
                    <IconCopy className="w-4 h-4" />
                  </button>
                )}
              </div>

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
          <div className="flex justify-start items-center p-4">
             <div className="relative w-12 h-12 flex items-center justify-center">
                <IconStar className="absolute text-yellow-400 w-4 h-4 animate-orbit z-20 animate-pulse-glow" />
                <IconGreamSkull className="text-slate-400 w-8 h-8 animate-shake z-10" />
             </div>
             <span className="text-xs font-mono text-cyan-400 uppercase ml-3 animate-pulse">
                {activeModel.provider === 'puter' ? `Connecting to ${activeModel.name}...` : 'Thinking...'}
             </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="flex-none p-4 md:p-6 bg-slate-900 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {renderModeButton(IntelligenceMode.SCRAPE_PLANNER, 'Scrape Plan', 'bg-amber-600', 'Generate data extraction strategies', <IconScrape className="w-3 h-3"/>)}
            {renderModeButton(IntelligenceMode.SUMMARY, 'Summary', 'bg-emerald-600', 'Concise overview')}
            {renderModeButton(IntelligenceMode.EXPLANATION, 'Explain', 'bg-blue-600', 'Simple analogies')}
            {renderModeButton(IntelligenceMode.DETAILED, 'Detailed', 'bg-indigo-600', 'Deep technical breakdowns')}
            {renderModeButton(IntelligenceMode.POPULAR, 'Popular', 'bg-orange-600', 'Trending opinions')}
            {renderModeButton(IntelligenceMode.HACKER, 'Hacker', 'bg-red-700', 'Educational Security', <IconShield className="w-3 h-3"/>)}
            {renderModeButton(IntelligenceMode.HALLUCIN, 'Imagine', 'bg-purple-600', 'Creative generation')}
          </div>

          <form onSubmit={(e) => handleSendMessage(e)} className="relative group">
            <div className={`absolute -inset-0.5 rounded-lg blur opacity-20 transition duration-1000 group-hover:opacity-50 ${
              mode === IntelligenceMode.HALLUCIN ? 'bg-purple-600' : 'bg-cyan-500'
            }`}></div>
            
            {/* UPDATED: Input Bar Styling with Conditional Base AI Glow and Mobile Clarity */}
            <div className={`relative flex items-center bg-slate-950/90 rounded-xl border transition-all duration-300 ${
              isBaseAI 
                ? 'border-green-400/80 shadow-[0_0_15px_-2px_rgba(74,222,128,0.5)] ring-1 ring-green-400/30' 
                : 'border-slate-700 focus-within:border-slate-500'
            }`}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  messages.length === 0 
                  ? `Ask ${activeModel.name} anything...` 
                  : "Follow up..."
                }
                className="flex-1 bg-transparent border-none text-white px-4 py-4 focus:ring-0 placeholder-slate-400 text-base md:text-sm"
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
          
          {/* UPDATED: Mobile Footer with Icon-Only Links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-600 w-full px-2 md:px-0">
             <div className="text-center md:text-left order-2 md:order-1 w-full md:w-auto">
                 {activeModel.id === 'gemini-1.5-flash' 
                   ? 'Powered by Gemini Model: GreamBvd(Base)'
                   : activeModel.provider === 'puter'
                     ? `Powered by Puter.js • Model: ${activeModel.name}`
                     : `Powered by Google Gemini • Model: ${activeModel.name}`
                 }
             </div>
             
             <div className="order-1 md:order-2 w-full md:w-auto flex justify-center md:justify-end gap-3">
               {/* Website Icon */}
               <a 
                 href="https://jasonmomanyi.netlify.app" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="group p-2 rounded-full hover:bg-slate-800 transition-all border border-slate-700/50 hover:border-cyan-500/50"
                 title="Developer Website"
               >
                 <IconNetworkGlobe className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors animate-pulse-glow" />
               </a>
               
               {/* Discord Icon */}
               <a 
                 href="https://discord.com/users/1092210946547654730" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="group p-2 rounded-full hover:bg-slate-800 transition-all border border-slate-700/50 hover:border-indigo-500/50"
                 title="Discord Profile"
               >
                 <IconDiscord className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
               </a>
             </div>
          </div>
        </div>
      </footer>

      {/* Overlays */}
      {isMemoryOpen && <MemoryManager onClose={() => navigate('/')} />}
      {showMediaHub && <MediaHub onClose={() => setShowMediaHub(false)} />}
      {showPresetSelector && <PresetSelector currentPersona={persona} onSelect={setPersona} onClose={() => setShowPresetSelector(false)} />}
      {showModelSelector && <ModelSelector currentModelId={currentModelId} onSelect={setCurrentModelId} onClose={() => setShowModelSelector(false)} />}
      {trainData.show && (
        <TrainModal 
          initialTrigger={trainData.trigger} 
          onClose={() => setTrainData({ show: false, trigger: '' })}
          onSuccess={(trigger) => {
             refreshMemoryCount();
             setMessages(prev => [...prev, {
               id: crypto.randomUUID(),
               role: 'model',
               content: `I have successfully learned the command "${trigger}".`,
               timestamp: Date.now(),
               isTrainedResponse: true
             }]);
          }}
        />
      )}
    </div>
  );
}