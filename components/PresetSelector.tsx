import React from 'react';
import { AIPersona } from '../types';
import { IconClose, IconPersonSuitcase, IconSparkles, IconShield, IconBrain } from './Icons';

interface Props {
  currentPersona: AIPersona;
  onSelect: (persona: AIPersona) => void;
  onClose: () => void;
}

interface PersonaOption {
  id: AIPersona;
  label: string;
  desc: string;
  color: string;
  icon?: React.ReactNode;
}

export const PresetSelector: React.FC<Props> = ({ currentPersona, onSelect, onClose }) => {
  
  const presets: PersonaOption[] = [
    { id: 'default', label: 'Default / Casual', desc: 'Balanced, neutral, helpful.', color: 'border-slate-500 text-slate-300' },
    { id: 'professional', label: 'Professional', desc: 'Corporate, formal, ROI-focused.', color: 'border-blue-500 text-blue-400' },
    { id: 'student', label: 'Student', desc: 'Curious, casual, relatable.', color: 'border-green-500 text-green-400' },
    { id: 'teacher', label: 'Teacher', desc: 'Patient, educational, structured.', color: 'border-orange-500 text-orange-400' },
    { id: 'kid', label: 'Kid (ELI5)', desc: 'Super simple, enthusiastic, emojis.', color: 'border-yellow-400 text-yellow-300' },
    { id: 'fun', label: 'Fun & Hilarious', desc: 'Witty, sarcastic, entertaining.', color: 'border-pink-500 text-pink-400' },
    { id: 'hacker', label: 'Hacker', desc: 'Tech-savvy, l33t speak, edgy.', color: 'border-red-500 text-red-400', icon: <IconShield className="w-4 h-4"/> },
    { id: 'robot', label: 'Robot', desc: 'Pure logic. No emotion. Binary.', color: 'border-gray-400 text-gray-300' },
    { id: 'pirate', label: 'Pirate', desc: 'Nautical, rough, adventurous.', color: 'border-amber-700 text-amber-600' },
    { id: 'shakespeare', label: 'Shakespeare', desc: 'Poetic, dramatic, archaic.', color: 'border-purple-500 text-purple-400' },
    { id: 'gangster', label: '50s Gangster', desc: 'Noir, street-smart, tough.', color: 'border-zinc-500 text-zinc-400' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex-none p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
               <IconPersonSuitcase className="text-indigo-400 w-6 h-6" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-white tracking-tight">Persona Presets</h2>
               <p className="text-xs text-indigo-300/60 font-mono mt-0.5">Customize Gream Bvddy's personality</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <IconClose className="text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
           {presets.map((p) => {
             const isSelected = currentPersona === p.id;
             return (
               <button
                 key={p.id}
                 onClick={() => {
                   onSelect(p.id);
                   onClose();
                 }}
                 className={`relative p-4 rounded-xl border text-left transition-all duration-200 group ${
                   isSelected 
                    ? `bg-slate-800 ${p.color} ring-1 ring-offset-2 ring-offset-slate-900 ring-indigo-500 shadow-lg` 
                    : `bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:border-slate-700`
                 }`}
               >
                 <div className="flex items-center justify-between mb-2">
                   <div className={`flex items-center gap-2 font-bold ${isSelected ? '' : 'text-slate-200'}`}>
                     {p.icon ? p.icon : <IconBrain className="w-4 h-4 opacity-50" />}
                     {p.label}
                   </div>
                   {isSelected && <IconSparkles className="w-4 h-4 text-yellow-400 animate-pulse" />}
                 </div>
                 <p className="text-xs opacity-70 leading-relaxed">
                   {p.desc}
                 </p>
               </button>
             );
           })}
        </div>
        
        <div className="p-4 border-t border-white/5 bg-slate-900/50 text-center">
           <p className="text-[10px] text-slate-500 font-mono">
             Changing persona alters the tone and style of the response, but the core intelligence remains the same.
           </p>
        </div>
      </div>
    </div>
  );
};