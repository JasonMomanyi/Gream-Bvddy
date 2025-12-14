import React, { useState, useEffect } from 'react';
import { MemoryStore } from '../services/memoryStore';
import { TrainedCommand } from '../types';
import { IconTrash, IconDatabase } from './Icons';

interface Props {
  onClose: () => void;
}

export const MemoryManager: React.FC<Props> = ({ onClose }) => {
  const [commands, setCommands] = useState<TrainedCommand[]>([]);

  useEffect(() => {
    setCommands(MemoryStore.load());
  }, []);

  const handleDelete = (id: string) => {
    MemoryStore.deleteCommand(id);
    setCommands(MemoryStore.load());
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <IconDatabase className="text-cyan-400" />
            <h2 className="text-xl font-bold text-slate-100">Gream Bvddy Neural Memory</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            Close
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {commands.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              <p>No trained commands yet.</p>
              <p className="text-sm mt-2">Teach the AI by clicking "Train" on your messages.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commands.map((cmd) => (
                <div key={cmd.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 group hover:border-cyan-500/50 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-mono text-cyan-400 font-bold text-sm">Input: "{cmd.trigger}"</h3>
                    <button 
                      onClick={() => handleDelete(cmd.id)}
                      className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-slate-300 text-sm mb-2">{cmd.response}</div>
                  {cmd.description && (
                    <div className="text-xs text-slate-500 italic">Context: {cmd.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};