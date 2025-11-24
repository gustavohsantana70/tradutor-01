import React, { useState, useEffect } from 'react';
import Translator from './components/Translator';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import DeveloperConsole from './components/DeveloperConsole';
import { TranslationConfig, TranslationStyle, DateStyle, AIModel, LegalDomain, AuthUser } from './types';
import { getCurrentUser, logout } from './services/authService';
import { BookOpen, ShieldCheck, Globe, Cpu, LogOut, User, Terminal } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
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
    customTerms: []
  });

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

  if (!user) {
    return <Login onLogin={setUser} />;
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
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">AI Powered Legal Localization</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
           <div className="flex items-center gap-2">
              <Globe size={14} />
              <span>{config.sourceLang} &rarr; {config.targetLang}</span>
           </div>
           <div className="flex items-center gap-2">
              <ShieldCheck size={14} />
              <span>{config.jurisdiction}</span>
           </div>
           <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full text-xs font-mono text-indigo-300 border border-slate-700">
             <Cpu size={12} />
             {config.model}
           </div>
           
           <div className="h-4 w-px bg-slate-700 mx-2"></div>
           
           <button 
            onClick={() => setIsDevConsoleOpen(true)}
            className="flex items-center gap-1 hover:text-white text-emerald-400 transition-colors"
           >
             <Terminal size={14} />
             <span>Developer</span>
           </button>

           <div className="flex items-center gap-2 text-white font-medium">
             <User size={14} />
             <span>{user.name}</span>
           </div>
           <button 
             onClick={handleLogout}
             className="text-slate-400 hover:text-white transition-colors"
             title="Logout"
           >
             <LogOut size={16} />
           </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 h-full relative">
            <Translator config={config} setConfig={setConfig} />
        </div>
      </main>

      {/* Chatbot Overlay */}
      <Chatbot />
    </div>
  );
};

export default App;