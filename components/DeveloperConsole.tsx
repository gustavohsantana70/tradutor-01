import React, { useState, useEffect } from 'react';
import { WebhookConfig, ApiLog } from '../types';
import { Terminal, Globe, Key, X, Activity, Save, RefreshCw } from 'lucide-react';

interface DeveloperConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'api' | 'webhooks' | 'logs'>('api');
  const [apiKey, setApiKey] = useState('lx_live_839293848192039283');
  const [webhook, setWebhook] = useState<WebhookConfig>({
    url: 'https://api.your-firm.com/callbacks/translations',
    active: true,
    events: ['translation.completed'],
    secret: 'whsec_...'
  });

  const [logs, setLogs] = useState<ApiLog[]>([]);

  // Simulate incoming logs
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      const endpoints = ['/v1/translate', '/v1/audit', '/v1/glossary/sync'];
      const newLog: ApiLog = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        method: Math.random() > 0.8 ? 'WEBHOOK' : 'POST',
        endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
        status: 200,
        latency: `${Math.floor(Math.random() * 500 + 50)}ms`
      };
      setLogs(prev => [newLog, ...prev].slice(0, 15));
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[650px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Terminal size={20} className="text-green-400" />
            <h2 className="font-bold text-lg">Developer Console</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('api')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-left transition-colors ${activeTab === 'api' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Key size={16} /> API Keys
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-left transition-colors ${activeTab === 'webhooks' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Globe size={16} /> Webhooks
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-left transition-colors ${activeTab === 'logs' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Activity size={16} /> Live Logs
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">API Authentication</h3>
                  <p className="text-sm text-gray-500 mb-4">Use this key to authenticate requests via the REST API.</p>
                  
                  <div className="bg-slate-800 rounded-md p-4 flex items-center justify-between">
                    <code className="text-green-400 font-mono text-sm">{apiKey}</code>
                    <button 
                      onClick={() => setApiKey(`lx_live_${Math.random().toString(36).substring(2)}`)}
                      className="text-gray-400 hover:text-white"
                      title="Roll Key"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-red-500 mt-2">Do not share this key in client-side code.</p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Usage Limits</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-xs text-gray-500 uppercase">Requests / min</div>
                      <div className="text-xl font-bold text-gray-800">1,250</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-xs text-gray-500 uppercase">Daily Characters</div>
                      <div className="text-xl font-bold text-gray-800">5M</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'webhooks' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Webhook Configuration</h3>
                  <p className="text-sm text-gray-500 mb-4">Receive real-time updates when large document translations are completed.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payload URL</label>
                      <input 
                        type="text" 
                        value={webhook.url}
                        onChange={(e) => setWebhook({...webhook, url: e.target.value})}
                        className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Secret (for signature verification)</label>
                       <div className="bg-gray-100 p-2 rounded border border-gray-200 font-mono text-xs text-gray-600">
                         {webhook.secret}
                       </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="wh-active" 
                        checked={webhook.active} 
                        onChange={(e) => setWebhook({...webhook, active: e.target.checked})}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="wh-active" className="text-sm text-gray-700">Active</label>
                    </div>

                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium">
                      <Save size={16} /> Save Webhook Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="h-full flex flex-col">
                 <h3 className="text-lg font-bold text-gray-800 mb-4">Real-time Request Logs</h3>
                 <div className="bg-slate-900 rounded-lg p-4 flex-1 overflow-y-auto font-mono text-xs text-gray-300 custom-scrollbar">
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-4 mb-2 border-b border-slate-800 pb-2 last:border-0">
                        <span className="text-slate-500 w-20 shrink-0">{log.timestamp.toLocaleTimeString()}</span>
                        <span className={`w-16 font-bold ${log.method === 'WEBHOOK' ? 'text-purple-400' : 'text-blue-400'}`}>{log.method}</span>
                        <span className="flex-1 text-slate-300 truncate">{log.endpoint}</span>
                        <span className="text-green-400 w-12 text-right">{log.status}</span>
                        <span className="text-slate-500 w-16 text-right">{log.latency}</span>
                      </div>
                    ))}
                    {logs.length === 0 && <div className="text-center text-slate-600 mt-10">Waiting for requests...</div>}
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperConsole;