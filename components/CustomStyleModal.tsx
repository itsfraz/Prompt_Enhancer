
import React, { useState } from 'react';
import { StyleDefinition } from '../types';

interface CustomStyleModalProps {
  onClose: () => void;
  onSave: (style: StyleDefinition) => void;
}

const CustomStyleModal: React.FC<CustomStyleModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [instruction, setInstruction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !instruction.trim()) return;

    onSave({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      instruction: instruction.trim(),
      isCustom: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="bg-white dark:bg-slate-900 relative w-full max-w-lg p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create Custom Style</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Style Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Cyberpunk Storytelling"
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Instruction / Context
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Describe how the AI should enhance your text. Be specific about tone, vocabulary, and formatting."
              className="w-full h-32 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none placeholder:text-slate-400"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition-all"
            >
              Save Style
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomStyleModal;