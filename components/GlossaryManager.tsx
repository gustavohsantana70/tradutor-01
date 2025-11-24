import React, { useState } from 'react';
import { GlossaryTerm, LegalDomain } from '../types';
import { Book, Plus, Trash2, X } from 'lucide-react';

interface GlossaryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  legalDomain: LegalDomain;
  customTerms: GlossaryTerm[];
  setCustomTerms: (terms: GlossaryTerm[]) => void;
}

const GlossaryManager: React.FC<GlossaryManagerProps> = ({ 
  isOpen, 
  onClose, 
  legalDomain, 
  customTerms, 
  setCustomTerms 
}) => {
  const [newSource, setNewSource] = useState('');
  const [newTarget, setNewTarget] = useState('');

  if (!isOpen) return null;

  const handleAddTerm = () => {
    if (newSource && newTarget) {
      const newTerm: GlossaryTerm = {
        id: Date.now().toString(),
        source: newSource,
        target: newTarget,
        domain: 'Custom'
      };
      setCustomTerms([...customTerms, newTerm]);
      setNewSource('');
      setNewTarget('');
    }
  };

  const handleRemoveTerm = (id: string) => {
    setCustomTerms(customTerms.filter(t => t.id !== id));
  };

  // Hardcoded display for System Glossaries to show user what's active
  // In a real app, this would be imported from the service or API
  const getSystemExampleTerms = () => {
    switch (legalDomain) {
      case LegalDomain.CONTRACTS:
        return [
          { s: 'Rescisão', t: 'Termination' },
          { s: 'Dolo', t: 'Willful Misconduct' },
          { s: 'Culpa', t: 'Negligence' }
        ];
      case LegalDomain.PENAL:
        return [
          { s: 'Réu', t: 'Defendant' },
          { s: 'Dolo', t: 'Intent/Malice' },
          { s: 'Denúncia', t: 'Indictment' }
        ];
      case LegalDomain.TAX:
        return [
          { s: 'Imposto de Renda', t: 'Income Tax' },
          { s: 'Fato Gerador', t: 'Taxable Event' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-indigo-700">
            <Book size={20} />
            <h2 className="text-lg font-bold">Glossary & Termbase Manager</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-6">
          <p className="text-sm text-gray-600 mb-6">
            Terms defined here will be strictly enforced during the translation process by the AI.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Left: System Glossary */}
            <div className="flex flex-col bg-slate-50 rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center justify-between">
                <span>System: {legalDomain}</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Read Only</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {legalDomain === LegalDomain.GENERAL ? (
                  <p className="text-xs text-gray-500 italic">No specific system terms for General domain.</p>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 bg-slate-100 uppercase sticky top-0">
                      <tr>
                        <th className="py-2 pl-2">Source</th>
                        <th className="py-2">Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {getSystemExampleTerms().map((term, i) => (
                        <tr key={i}>
                          <td className="py-2 pl-2 text-gray-700 font-medium">{term.s}</td>
                          <td className="py-2 text-gray-600">{term.t}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={2} className="py-2 text-xs text-center text-gray-400 italic">...and more system terms</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right: Custom User Terms */}
            <div className="flex flex-col bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 uppercase mb-3">My Custom Terms (TM)</h3>
              
              {/* Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Source"
                  className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Target"
                  className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                />
                <button 
                  onClick={handleAddTerm}
                  disabled={!newSource || !newTarget}
                  className="bg-indigo-600 text-white p-1.5 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-gray-100 pt-2">
                {customTerms.length === 0 ? (
                  <div className="text-center mt-10 text-gray-400 text-xs">
                    <p>No custom terms added.</p>
                    <p>Add terms to enforce specific translations.</p>
                  </div>
                ) : (
                   <table className="w-full text-sm text-left">
                    <tbody className="divide-y divide-gray-100">
                      {customTerms.map((term) => (
                        <tr key={term.id} className="group hover:bg-gray-50">
                          <td className="py-2 pl-1 text-gray-700">{term.source}</td>
                          <td className="py-2 text-gray-600">{term.target}</td>
                          <td className="py-2 text-right pr-1">
                            <button 
                              onClick={() => handleRemoveTerm(term.id)}
                              className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
          <button 
            onClick={onClose}
            className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlossaryManager;