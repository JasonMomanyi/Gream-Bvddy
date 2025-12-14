import React, { useState } from 'react';
import { generateImage, generateSpeech } from '../services/geminiService';
import { 
  IconClose, IconImage, IconMusic, IconFilm, IconText, 
  IconSparkles, IconGreamSkull 
} from './Icons';

interface Props {
  onClose: () => void;
}

type Tab = 'audio' | 'video' | 'graphics' | 'text';

export const MediaHub: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('graphics');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('Kore');

  // Voices available in Gemini TTS
  const voices = [
    { name: 'Kore', gender: 'Female', desc: 'Calm, soothing' },
    { name: 'Puck', gender: 'Male', desc: 'Energetic, clear' },
    { name: 'Charon', gender: 'Male', desc: 'Deep, authoritative' },
    { name: 'Fenrir', gender: 'Male', desc: 'Rough, strong' },
    { name: 'Zephyr', gender: 'Female', desc: 'Soft, gentle' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResult(null);

    try {
      if (activeTab === 'graphics') {
        const base64Image = await generateImage(prompt);
        setResult(base64Image);
      } else if (activeTab === 'audio') {
        const base64Audio = await generateSpeech(prompt, selectedVoice);
        setResult(base64Audio);
      } else if (activeTab === 'text') {
        // Placeholder for future creative writing module
        setResult("Feature coming soon: Advanced Creative Writing Engine.");
      }
    } catch (error) {
      console.error(error);
      alert("Generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if (!result) return;
    const audio = new Audio(`data:audio/mp3;base64,${result}`);
    audio.play();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-[0_0_100px_rgba(168,85,247,0.15)] relative overflow-hidden">
        
        {/* Ambient Bg */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <div className="flex-none p-6 border-b border-white/5 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
               <IconSparkles className="text-purple-400 w-6 h-6" />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-white tracking-tight">Multimedia Generation Hub</h2>
               <p className="text-xs text-purple-300/60 font-mono mt-0.5">Powered by Gemini Nano & Neural Audio</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <IconClose className="text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Sidebar + Content Layout */}
        <div className="flex flex-1 overflow-hidden relative z-10">
          
          {/* Sidebar Tabs */}
          <div className="w-20 md:w-64 border-r border-white/5 bg-slate-950/30 flex flex-col p-4 gap-2">
             <button 
               onClick={() => setActiveTab('graphics')}
               className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'graphics' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <IconImage className="w-5 h-5" />
               <span className="hidden md:block font-medium">Graphics (Copilot/Nano)</span>
             </button>
             
             <button 
               onClick={() => setActiveTab('audio')}
               className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'audio' ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <IconMusic className="w-5 h-5" />
               <span className="hidden md:block font-medium">Audio (11Labs/Gemini)</span>
             </button>

             <button 
               onClick={() => setActiveTab('text')}
               className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'text' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <IconText className="w-5 h-5" />
               <span className="hidden md:block font-medium">Creative Text</span>
             </button>

             <button 
               onClick={() => setActiveTab('video')}
               className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'video' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <IconFilm className="w-5 h-5" />
               <span className="hidden md:block font-medium">Video</span>
             </button>
          </div>

          {/* Main Display Area */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col">
            
            {activeTab === 'video' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                <IconFilm className="w-24 h-24 mb-6 text-slate-600 animate-pulse" />
                <h3 className="text-2xl font-bold text-white mb-2">Module Under Construction</h3>
                <p className="text-slate-400 max-w-md">The Video Generation engine is currently in development. Check back later for neural video synthesis capabilities.</p>
              </div>
            ) : (
              <>
                {/* Input Section */}
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-500 mb-2">
                      {activeTab === 'graphics' ? 'Image Prompt' : activeTab === 'audio' ? 'Text to Speech' : 'Creative Brief'}
                    </label>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={
                        activeTab === 'graphics' ? "A futuristic city on Mars, neon lights, highly detailed..." :
                        activeTab === 'audio' ? "Enter text to be spoken by the AI..." :
                        "Describe the creative text you need..."
                      }
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 h-32 resize-none"
                    />
                  </div>

                  {activeTab === 'audio' && (
                    <div>
                      <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Voice Tone (11Labs / Neural)</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {voices.map(v => (
                          <button
                            key={v.name}
                            onClick={() => setSelectedVoice(v.name)}
                            className={`p-3 rounded-lg border text-left transition-all ${selectedVoice === v.name ? 'bg-pink-900/30 border-pink-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                          >
                            <div className="font-bold text-sm">{v.name}</div>
                            <div className="text-[10px] opacity-70">{v.gender} • {v.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      activeTab === 'graphics' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500' :
                      activeTab === 'audio' ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500' :
                      'bg-gradient-to-r from-blue-600 to-cyan-600'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <IconGreamSkull className="w-5 h-5 animate-spin" /> Generating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <IconSparkles className="w-5 h-5" /> Generate {activeTab === 'graphics' ? 'Visuals' : activeTab === 'audio' ? 'Audio' : 'Text'}
                      </span>
                    )}
                  </button>
                </div>

                {/* Result Section */}
                {result && (
                  <div className="flex-1 bg-slate-950/50 rounded-2xl border border-slate-700/50 p-4 flex items-center justify-center relative overflow-hidden group">
                     {activeTab === 'graphics' && (
                       <img src={result} alt="Generated" className="max-w-full max-h-[400px] rounded-lg shadow-2xl" />
                     )}
                     
                     {activeTab === 'audio' && (
                       <div className="text-center">
                         <div className="w-32 h-32 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                           <IconMusic className="w-16 h-16 text-pink-500" />
                         </div>
                         <h3 className="text-xl font-bold text-white mb-4">Audio Ready</h3>
                         <button 
                           onClick={playAudio}
                           className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-pink-50 transition-colors flex items-center gap-2 mx-auto"
                         >
                            ▶ Play Output
                         </button>
                         <p className="mt-4 text-xs text-slate-500">Generated via Gemini Neural TTS</p>
                       </div>
                     )}

                     {activeTab === 'text' && (
                        <p className="text-slate-300 italic">{result}</p>
                     )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};