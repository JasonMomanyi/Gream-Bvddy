import React, { useState } from 'react';
import { MemoryStore } from '../services/memoryStore';
import { IconBrain } from './Icons';

interface Props {
  initialTrigger: string;
  onClose: () => void;
  onSuccess: (trigger: string) => void;
}

export const TrainModal: React.FC<Props> = ({ initialTrigger, onClose, onSuccess }) => {
  const [trigger, setTrigger] = useState(initialTrigger);
  const [response, setResponse] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trigger || !response) return;
    
    MemoryStore.addCommand(trigger, response, description);
    onSuccess(trigger);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-xl w-full max-w-lg shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-1">
            <IconBrain className="text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Train Gream Bvddy</h2>
          </div>
          <p className="text-slate-400 text-sm">Define a custom response for a specific command.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 mb-1">When I say...</label>
            <input
              type="text"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="e.g., project status"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 mb-1">You respond...</label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="The project is currently in Phase 2..."
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Context / Notes (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 focus:outline-none focus:border-cyan-500"
              placeholder="e.g., Monthly report format"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!trigger || !response}
              className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save to Memory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};