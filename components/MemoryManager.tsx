import React, { useState, useEffect, useMemo } from 'react';
import { MemoryStore } from '../services/memoryStore';
import { TrainedCommand } from '../types';
import { IconTrash, IconDatabase, IconSearch, IconBrain } from './Icons';

interface Props {
  onClose: () => void;
}

export const MemoryManager: React.FC<Props> = ({ onClose }) => {
  const [commands, setCommands] = useState<TrainedCommand[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load commands on mount with a simulated "indexing" delay for AI effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCommands(MemoryStore.load());
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = (id: string) => {
    MemoryStore.deleteCommand(id);
    setCommands(MemoryStore.load());
  };

  const filteredCommands = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return commands.filter(c => 
      c.trigger.includes(lower) || 
      c.response.toLowerCase().includes(lower) ||
      (c.description && c.description.toLowerCase().includes(lower))
    );
  }, [commands, searchTerm]);

  // Calculate generic stats
  const stats = useMemo(() => {
    const sizeBytes = JSON.stringify(commands).length;
    const sizeDisplay = sizeBytes > 1024 ? `${(sizeBytes / 1024).toFixed(1)} KB` : `${sizeBytes} B`;
    return {
      count: commands.length,
      size: sizeDisplay
    };
  }, [commands]);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>

        {/* Header */}
        <div className="flex-none p-6 border-b border-white/5 bg-slate-900/50 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <IconDatabase className="text-cyan-400 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Neural Memory Bank</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Manage learned patterns and responses</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              title="Close Memory Manager"
              className="text-slate-400 hover:text-white px-3 py-1 hover:bg-white/5 rounded-lg transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Total Patterns</span>
              <span className="text-xl font-mono text-white">{stats.count}</span>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Database Size</span>
              <span className="text-xl font-mono text-cyan-400">{stats.size}</span>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-white/5 flex flex-col justify-center">
               <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">System Status</span>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-sm font-bold text-emerald-400">Online</span>
               </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-none px-6 py-4 bg-slate-900 border-b border-white/5 z-10">
          <div className="relative group">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search triggers or responses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
        
        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px] relative z-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-700 rounded-full"></div>
                <div className="w-12 h-12 border-4 border-t-cyan-500 rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-sm font-mono animate-pulse">Indexing Neural Pathways...</p>
            </div>
          ) : filteredCommands.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-12">
              <div className="p-4 bg-slate-800/50 rounded-full mb-4">
                 <IconBrain className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-lg font-medium text-slate-400">
                {searchTerm ? "No matches found." : "Memory Bank Empty"}
              </p>
              <p className="text-sm max-w-xs mt-2 text-slate-600">
                {searchTerm ? "Try a different search query." : "Train the AI by clicking the edit icon on your messages to add custom responses."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCommands.map((cmd) => (
                <div key={cmd.id} className="bg-slate-800/40 hover:bg-slate-800 rounded-xl p-4 border border-slate-700/50 hover:border-cyan-500/30 transition-all group relative">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-900/30 text-cyan-400 border border-cyan-500/20">TRIGGER</span>
                        <h3 className="font-bold text-white text-sm truncate">"{cmd.trigger}"</h3>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                        {cmd.response}
                      </p>
                      {cmd.description && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 font-mono">
                          <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                          {cmd.description}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(cmd.id)}
                      title="Delete from memory"
                      className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};