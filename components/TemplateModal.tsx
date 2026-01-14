
import React, { useState } from 'react';
import { PromptTemplate } from '../types';

interface TemplateModalProps {
  onClose: () => void;
  onSave: (template: PromptTemplate) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    onSave({
      id: `tpl-${Date.now()}`,
      name: name.trim(),
      content: content.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 relative w-full max-w-lg p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create Prompt Template</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Template Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Marketing Copy"
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Template Structure</label>
              <span className="text-[10px] text-blue-500 font-bold uppercase">Use &#123;&#123;variable&#125;&#125; syntax</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a short story about {{character}} in a {{setting}}..."
              className="w-full h-32 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none placeholder:text-slate-400"
              required
            />
            <p className="mt-2 text-[11px] text-slate-500 italic">
              {/* Using HTML entities for curly braces to prevent JSX expression parsing errors */}
              Example: "Help me write a &#123;&#123;topic&#125;&#125; post for &#123;&#123;platform&#125;&#125; about &#123;&#123;detail&#125;&#125;."
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition-all">Save Template</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateModal;
