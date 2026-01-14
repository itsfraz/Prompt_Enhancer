
import React, { useState, useEffect, useMemo } from 'react';
import { StyleDefinition, EnhancementResult, HistoryItem, PromptTemplate } from './types';
import { enhancePrompt } from './services/geminiService';
import StyleSelector from './components/StyleSelector';
import ComparisonCard from './components/ComparisonCard';
import CustomStyleModal from './components/CustomStyleModal';
import TemplateSelector from './components/TemplateSelector';
import TemplateModal from './components/TemplateModal';

const PREDEFINED_STYLES: StyleDefinition[] = [
  { id: 'creative', name: 'Creative Writing', isCustom: false, instruction: 'Make it more descriptive and engaging. Focus on sensory details and character voice.' },
  { id: 'agentic_ide', name: 'Vibe Coding & Agentic IDEs', isCustom: false, instruction: 'Act as a professional prompt engineer for coding agents (e.g., Cursor, Windsurf, Copilot). Refine user input into actionable, step-by-step instructions. Focus on optimizing for clarity, providing relevant technical details, specifying architectural constraints, and ensuring instructions are optimized for model adherence in an iterative development workflow.' },
  { id: 'vibe_coding', name: 'Workflow Architect', isCustom: false, instruction: 'Act as an Expert Workflow Architect for Agentic IDEs. Restructure the user input into a logical, iterative implementation plan. Use clear system-level instructions, step-by-step logic, and specify expected tech stacks where applicable. Focus on readability for a coding agent.' },
  { id: 'image_gen', name: 'Image Generation', isCustom: false, instruction: 'Act as a Professional Prompt Engineer for Midjourney/DALL-E. Expand the user\'s idea into a highly descriptive synthesis prompt. Include technical details: lighting (e.g., cinematic, volumetric), lens (e.g., 85mm, wide-angle), composition (e.g., low-angle, rule of thirds), and specific artistic styles or mediums.' },
  { id: 'professional', name: 'Professional', isCustom: false, instruction: 'Refine for a corporate environment. Ensure polite, clear, and concise language. Focus on actionable items and respect.' },
  { id: 'academic', name: 'Academic', isCustom: false, instruction: 'Use formal language, specialized terminology, and clear logical structure. Avoid contractions and colloquialisms.' },
  { id: 'chatbot', name: 'System Prompt', isCustom: false, instruction: 'Optimize as an instruction set for a Large Language Model. Use delimiters, specify persona, and define constraints clearly.' },
  { id: 'casual', name: 'Casual', isCustom: false, instruction: 'Keep it friendly, relatable, and suitable for social media. Use emojis sparingly and maintain a conversational flow.' },
  { id: 'technical', name: 'Technical Docs', isCustom: false, instruction: 'Focus on precision, step-by-step clarity, and lack of ambiguity. Use consistent terminology.' }
];

const DEFAULT_TEMPLATES: PromptTemplate[] = [
  { 
    id: 'feature_req', 
    name: 'Feature Request', 
    content: 'I want to add a feature for {{feature_name}}. It should allow users to {{capability}}. The key benefit is {{benefit}}.' 
  },
  { 
    id: 'blog_post', 
    name: 'Blog Post Draft', 
    content: 'Write a blog post about {{topic}}. The target audience is {{audience}}. The tone should be {{tone}} and the main takeaway is {{key_takeaway}}.' 
  }
];

const EXAMPLES: Record<string, string[]> = {
  'creative': ["A lonely clockmaker discovers a watch that can pause time.", "Write a short poem about the first snowfall.", "The secret life of a houseplant."],
  'agentic_ide': [
    "I need a Python script to scrape a website and save it to a database.",
    "Help me add user authentication to my Next.js app with Supabase.",
    "Refactor this mess of a CSS file into clean Tailwind classes."
  ],
  'vibe_coding': [
    "Refactor this legacy React class component into a functional one using modern Hooks and Tailwind CSS.",
    "Build a responsive, glassmorphic landing page hero section."
  ]
};

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [customStyles, setCustomStyles] = useState<StyleDefinition[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  
  const [selectedStyle, setSelectedStyle] = useState<StyleDefinition>(PREDEFINED_STYLES[0]);
  const [intensity, setIntensity] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnhancementResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const allStyles = [...PREDEFINED_STYLES, ...customStyles];

  // Detect placeholders in the selected template
  const placeholders = useMemo(() => {
    if (!selectedTemplate) return [];
    const matches = selectedTemplate.content.match(/{{(.*?)}}/g);
    return matches ? Array.from(new Set(matches.map(m => m.replace(/{{|}}/g, '')))) : [];
  }, [selectedTemplate]);

  // Update input whenever template or placeholder values change
  useEffect(() => {
    if (selectedTemplate) {
      let newContent = selectedTemplate.content;
      Object.entries(templateValues).forEach(([key, val]) => {
        newContent = newContent.replaceAll(`{{${key}}}`, val || `[${key}]`);
      });
      setInput(newContent);
    }
  }, [selectedTemplate, templateValues]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('prompt_history');
    if (savedHistory) try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    
    const savedCustomStyles = localStorage.getItem('custom_styles');
    if (savedCustomStyles) try { setCustomStyles(JSON.parse(savedCustomStyles)); } catch (e) {}

    const savedTemplates = localStorage.getItem('user_templates');
    if (savedTemplates) try { setTemplates(JSON.parse(savedTemplates)); } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('prompt_history', JSON.stringify(history.slice(0, 20)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('custom_styles', JSON.stringify(customStyles));
  }, [customStyles]);

  useEffect(() => {
    localStorage.setItem('user_templates', JSON.stringify(templates));
  }, [templates]);

  const handleEnhance = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const enhancedResult = await enhancePrompt(input, selectedStyle, intensity);
      setResult(enhancedResult);
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        styleId: selectedStyle.id,
        styleName: selectedStyle.name,
        result: enhancedResult
      };
      setHistory(prev => [newHistoryItem, ...prev]);
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomStyle = (newStyle: StyleDefinition) => {
    setCustomStyles(prev => [...prev, newStyle]);
    setSelectedStyle(newStyle);
  };

  const handleDeleteCustomStyle = (id: string) => {
    setCustomStyles(prev => prev.filter(s => s.id !== id));
    if (selectedStyle.id === id) setSelectedStyle(PREDEFINED_STYLES[0]);
  };

  const handleSaveTemplate = (newTemplate: PromptTemplate) => {
    setTemplates(prev => {
      const existing = prev.find(t => t.id === newTemplate.id);
      if (existing) return prev.map(t => t.id === newTemplate.id ? newTemplate : t);
      return [...prev, newTemplate];
    });
    setSelectedTemplate(newTemplate);
    setTemplateValues({});
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen pb-20 transition-colors duration-300">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              PromptForge AI
            </span>
          </div>

          <button
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Elevate Your <span className="gradient-text">Prompts & Stories</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Harness the power of AI to transform mediocre ideas into compelling narratives and highly-optimized AI prompts.
          </p>
        </section>

        <div className="glass-morphism rounded-3xl p-6 md:p-8 mb-12 shadow-2xl relative overflow-hidden transition-all duration-300 border border-slate-200 dark:border-white/10">
          <div className="relative z-10">
            <div className="flex flex-col gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest">
                  1. Enhancement Style
                </label>
                <StyleSelector 
                  styles={allStyles} 
                  selectedId={selectedStyle.id} 
                  onSelect={setSelectedStyle}
                  onDelete={handleDeleteCustomStyle}
                  onAddNew={() => setIsStyleModalOpen(true)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest">
                  2. Prompt Templates
                </label>
                <TemplateSelector 
                  templates={templates}
                  selectedId={selectedTemplate?.id || null}
                  onSelect={(t) => { setSelectedTemplate(t); setTemplateValues({}); }}
                  onDelete={handleDeleteTemplate}
                  onAddNew={() => setIsTemplateModalOpen(true)}
                />
              </div>
            </div>

            {selectedTemplate && placeholders.length > 0 && (
              <div className="mb-8 p-6 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Template Variables
                  </h4>
                  <button onClick={() => { setSelectedTemplate(null); setInput(''); }} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Clear Template</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {placeholders.map(ph => (
                    <div key={ph}>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{ph.replace(/_/g, ' ')}</label>
                      <input 
                        type="text" 
                        value={templateValues[ph] || ''}
                        onChange={(e) => setTemplateValues(prev => ({ ...prev, [ph]: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder={`Enter ${ph.replace(/_/g, ' ')}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative group">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest">
                3. Final Prompt Content
              </label>
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (selectedTemplate) setSelectedTemplate(null); // Detach from template if user types directly
                }}
                placeholder="Enter your prompt or story fragment..."
                className="w-full h-48 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none shadow-inner"
              />
              <div className="absolute bottom-4 right-4 text-xs text-slate-400 dark:text-slate-500">
                {input.length} characters
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={handleEnhance}
                disabled={loading || !input.trim()}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all shadow-lg ${
                  loading || !input.trim()
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 dark:hover:bg-slate-100'
                }`}
              >
                {loading ? (
                   <div className="flex items-center gap-3">
                     <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                     Forging perfection...
                   </div>
                ) : "Enhance Writing"}
              </button>
              <button
                onClick={() => { setInput(''); setSelectedTemplate(null); setTemplateValues({}); }}
                className="px-6 py-4 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Reset
              </button>
            </div>
            {error && <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm">{error}</div>}
          </div>
        </div>

        {result && (
          <section id="results" className="mb-20 scroll-mt-24">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-bold">Transformation Result</h2>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            </div>
            <ComparisonCard result={result} />
          </section>
        )}

        {history.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Recent Forge Activity</h2>
              <button 
                onClick={() => setShowClearHistoryConfirm(true)}
                className="text-sm text-slate-500 hover:text-red-500 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-500/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 dark:hover:border-slate-700 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                  onClick={() => {
                    setResult(item.result);
                    setInput(item.result.original);
                    const foundStyle = allStyles.find(s => s.id === item.styleId);
                    if (foundStyle) setSelectedStyle(foundStyle);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {item.styleName}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {item.result.enhanced}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {isStyleModalOpen && (
        <CustomStyleModal onClose={() => setIsStyleModalOpen(false)} onSave={handleSaveCustomStyle} />
      )}
      {isTemplateModalOpen && (
        <TemplateModal onClose={() => setIsTemplateModalOpen(false)} onSave={handleSaveTemplate} />
      )}

      {showClearHistoryConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowClearHistoryConfirm(false)} />
          <div className="bg-white dark:bg-slate-900 relative w-full max-w-sm p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 text-center border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Clear History?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm">This action will permanently delete all your previous enhancement activities.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearHistoryConfirm(false)} className="flex-1 py-3 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={() => { setHistory([]); setShowClearHistoryConfirm(false); }} className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
