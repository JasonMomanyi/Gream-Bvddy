import React from 'react';
import { AVAILABLE_MODELS, ModelConfig } from '../types';
import { IconBrain, IconSparkles, IconShield, IconClose } from './Icons';

interface Props {
  currentModelId: string;
  onSelect: (modelId: string) => void;
  onClose: () => void;
}

export const ModelSelector: React.FC<Props> = ({ currentModelId, onSelect, onClose }) => {
  
  const googleModels = AVAILABLE_MODELS.filter(m => m.provider === 'google');
  const puterModels = AVAILABLE_MODELS.filter(m => m.provider === 'puter');

  const renderModelBtn = (model: ModelConfig) => {
    const isSelected = currentModelId === model.id;
    return (
      <button
        key={model.id}
        onClick={() => {
          onSelect(model.id);
          onClose();
        }}
        className={`w-full text-left p-3 rounded-lg border transition-all mb-2 flex items-center justify-between group ${
          isSelected 
            ? 'bg-cyan-900/30 border-cyan-500/50 text-white shadow-lg' 
            : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>{model.name}</span>
            {model.isFree && <span className="text-[9px] bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Free</span>}
          </div>
          <div className="text-xs opacity-70 mt-1 line-clamp-1">{model.description}</div>
        </div>
        {isSelected && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]"></div>}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-900/80">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
               <IconBrain className="text-purple-400 w-5 h-5" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-white">Neural Engine</h2>
               <p className="text-xs text-slate-400">Select your active intelligence model</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <IconSparkles className="w-3 h-3 text-yellow-500" /> 
              Google Gemini (Native)
            </h3>
            {googleModels.map(renderModelBtn)}
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <IconShield className="w-3 h-3 text-emerald-500" /> 
              External Models (Claude, GPT, DeepSeek)
            </h3>
            <div className="bg-slate-800/30 rounded-lg p-3 mb-3 border border-dashed border-slate-700">
               <p className="text-[10px] text-slate-400 leading-relaxed">
                 ℹ️ <strong>Tip:</strong> If Gemini is giving you "Quota/Capacity" errors, switch to one of these models. They are powered by Puter.js and have separate free limits.
               </p>
            </div>
            {puterModels.map(renderModelBtn)}
          </div>

        </div>

      </div>
    </div>
  );
};