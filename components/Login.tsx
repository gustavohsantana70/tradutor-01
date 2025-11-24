
import React, { useState } from 'react';
import { login } from '../services/authService';
import { AuthUser, UILanguage } from '../types';
import { ShieldCheck, Loader2, BookOpen } from 'lucide-react';
import { LABELS } from '../services/localizationService';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
  uiLang: UILanguage;
  setUiLang: (lang: UILanguage) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, uiLang, setUiLang }) => {
  const t = LABELS[uiLang];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      onLogin(user);
    } catch (err) {
      setError('Invalid credentials. Try "admin" / "password".');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="absolute top-4 right-4">
         <button 
             onClick={() => setUiLang(uiLang === 'pt' ? 'en' : 'pt')}
             className="flex items-center gap-2 bg-white px-3 py-1 rounded shadow text-sm font-bold text-gray-700"
             title="Switch Language"
           >
             <span>{uiLang === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN'}</span>
           </button>
      </div>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-12 h-12 bg-indigo-500 rounded mx-auto flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t.appTitle}</h1>
          <p className="text-slate-400 text-sm mt-2">{t.appSubtitle}</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <input
                type="email"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="lawyer@firm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
              <input
                type="password"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/30 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              {t.loginBtn}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              {t.loginFooter}
              <br/>All data is processed via secure TLS channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
