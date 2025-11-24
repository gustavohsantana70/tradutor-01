
import React, { useState, useEffect } from 'react';
import Translator from './components/Translator';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import DeveloperConsole from './components/DeveloperConsole';
import { TranslationConfig, TranslationStyle, DateStyle, AIModel, LegalDomain, AuthUser, TranslationEngine, UILanguage } from './types';
import { getCurrentUser, logout } from './services/authService';
import { BookOpen, ShieldCheck, Globe, Cpu, LogOut, User, Terminal } from 'lucide-react';
import { LABELS } from './services/localizationService';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [uiLang, setUiLang] = useState<UILanguage>('pt'); // Default to Portuguese
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);
  const [config, setConfig] = useState<TranslationConfig>({
    sourceLang: 'pt-BR',
    targetLang: 'en-US',
    jurisdiction: 'US',
    style: TranslationStyle.LEGAL,
    formatNumeric: false,
    dateStyle: DateStyle.JURISDICTION,
    model: AIModel.GEMINI_3_PRO,
    legalDomain: LegalDomain.CONTRACTS,
    activeEngine: TranslationEngine.GEMINI,
    customTerms: []
  });

  const t = LABELS[uiLang];

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const toggleLanguage = () => {
    setUiLang(prev => prev === 'en' ? 'pt' : 'en');
  };

  if (!user) {
    return <Login onLogin={setUser} uiLang={uiLang} setUiLang={setUiLang} />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden font-sans">
      <DeveloperConsole isOpen={isDevConsoleOpen} onClose={() => setIsDevConsoleOpen(false)} />

      {/* App Header */}
      <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center shadow-md shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">LexiGen <span className="text-indigo-400 font-light">Translator</span></h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">{t.appSubtitle}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
           
           {/* Language Switcher */}
           <button 
             onClick={toggleLanguage}
             className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded transition-colors"
             title="Switch UI Language"
           >
             <span className="text-lg leading-none">{uiLang === 'pt' ? '🇧🇷' : '🇺🇸'}</span>
             <span className="text-xs font-bold">{uiLang.toUpperCase()}</span>
           </button>

           <div className="flex items-center gap-2">
              <Globe size={14} />
              <span>{config.sourceLang} &rarr; {config.targetLang}</span>
           </div>
           
           <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full text-xs font-mono text-indigo-300 border border-slate-700">
             <Cpu size={12} />
             {config.activeEngine === TranslationEngine.MARIAN ? t.engineMarian : t.engineGemini}
           </div>
           
           <div className="h-4 w-px bg-slate-700 mx-2"></div>
           
           <button 
            onClick={() => setIsDevConsoleOpen(true)}
            className="flex items-center gap-1 hover:text-white text-emerald-400 transition-colors"
           >
             <Terminal size={14} />
             <span>{t.developer}</span>
           </button>

           <div className="flex items-center gap-2 text-white font-medium">
             <User size={14} />
             <span>{user.name}</span>
           </div>
           <button 
             onClick={handleLogout}
             className="text-slate-400 hover:text-white transition-colors"
             title={t.logout}
           >
             <LogOut size={16} />
           </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 h-full relative">
            <Translator config={config} setConfig={setConfig} uiLang={uiLang} />
        </div>
      </main>

      {/* Chatbot Overlay */}
      <Chatbot uiLang={uiLang} />
    </div>
  );
};

export default App;
