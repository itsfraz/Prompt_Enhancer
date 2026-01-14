
import React, { useState, useEffect } from 'react';
import { EnhancementResult } from '../types';

interface ComparisonCardProps {
  result: EnhancementResult;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.enhanced);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-4">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Original</h3>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 min-h-[200px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed shadow-sm transition-colors duration-300">
          {result.original}
        </div>
      </div>
      
      <div className="flex flex-col space-y-4">
        <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Enhanced Version</h3>
        <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 min-h-[200px] text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed shadow-xl shadow-blue-500/5 transition-colors duration-300 relative">
          {result.enhanced}
          <div className="mt-4 flex justify-end">
             <button 
                onClick={handleCopy}
                className={`text-xs flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  copied 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-500/5 hover:text-blue-700 dark:hover:text-blue-300'
                }`}
             >
               {copied ? (
                 <>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-in zoom-in duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                   Copied!
                 </>
               ) : (
                 <>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                   </svg>
                   Copy
                 </>
               )}
             </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 mt-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Improvement Summary</h4>
          <p className="text-slate-600 dark:text-slate-400 mb-6 italic leading-relaxed">{result.explanation}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h5 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Key Changes
              </h5>
              <ul className="space-y-2">
                {result.keyChanges.map((change, i) => (
                  <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-blue-500 mt-1 font-bold">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Writing Tips
              </h5>
              <ul className="space-y-2">
                {result.tips.map((tip, i) => (
                  <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-emerald-500 mt-1 font-bold">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonCard;
