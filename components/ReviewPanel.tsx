import React, { useMemo } from 'react';
import { GlossaryTerm, TranslationConfig } from '../types';
import { SYSTEM_GLOSSARIES } from '../services/geminiService';
import { X, Check, AlertCircle, BookOpen, ArrowRight } from 'lucide-react';

interface ReviewPanelProps {
  sourceText: string;
  targetText: string;
  config: TranslationConfig;
  onClose: () => void;
}

const ReviewPanel: React.FC<ReviewPanelProps> = ({ sourceText, targetText, config, onClose }) => {
  // Combine System and Custom terms
  const allTerms = useMemo(() => {
    const systemTerms = SYSTEM_GLOSSARIES[config.legalDomain] || [];
    return [...systemTerms, ...config.customTerms];
  }, [config.legalDomain, config.customTerms]);

  // Check which terms appear in source and if they appear in target
  const reviewData = useMemo(() => {
    return allTerms.map(term => {
      // Simple case-insensitive check. Real-world would need regex or tokenization.
      const inSource = sourceText.toLowerCase().includes(term.source.toLowerCase());
      const inTarget = targetText.toLowerCase().includes(term.target.toLowerCase());
      
      return {
        ...term,
        foundInSource: inSource,
        foundInTarget: inTarget,
        isCompliant: !inSource || inTarget // Compliant if not in source OR (in source AND in target)
      };
    }).filter(t => t.foundInSource); // Only show terms that are actually relevant to this document
  }, [allTerms, sourceText, targetText]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <BookOpen size={20} className="text-indigo-400" />
          <div>
            <h2 className="font-bold text-lg">Review & Glossary Check</h2>
            <p className="text-xs text-slate-400">Comparing Original vs Translation against {config.legalDomain} Termbase</p>
          </div>
        </div>
        <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-sm transition-colors">
          Exit Review
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Texts Area */}
        <div className="flex-1 flex flex-col md:flex-row border-b md:border-b-0 md:border-r border-gray-200 h-1/2 md:h-full">
          {/* Source */}
          <div className="flex-1 flex flex-col border-r border-gray-200 bg-gray-50">
            <div className="p-2 border-b border-gray-200 bg-gray-100 text-xs font-bold text-gray-600 uppercase">
              Original ({config.sourceLang})
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap custom-scrollbar">
              {sourceText}
            </div>
          </div>
          {/* Target */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="p-2 border-b border-gray-200 bg-indigo-50 text-xs font-bold text-indigo-700 uppercase">
              Translation ({config.targetLang})
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap custom-scrollbar">
              {targetText}
            </div>
          </div>
        </div>

        {/* Glossary Check Panel (Bottom on mobile, Right on Desktop) */}
        <div className="h-1/2 md:h-full w-full md:w-96 bg-slate-50 border-l border-gray-200 flex flex-col shadow-xl z-10">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <BookOpen size={16} />
              Applied Glossary
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {reviewData.length} relevant terms found in source text.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {reviewData.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">
                <p>No glossary terms detected in the source text.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewData.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded border ${item.isCompliant ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold uppercase text-gray-500">{item.domain}</span>
                      {item.isCompliant ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          <Check size={12} /> Match
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                          <X size={12} /> Missing
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-800">{item.source}</span>
                      <ArrowRight size={14} className="text-gray-400" />
                      <span className={`${item.isCompliant ? 'text-indigo-600 font-medium' : 'text-red-500 font-bold'}`}>
                        {item.target}
                      </span>
                    </div>

                    {!item.isCompliant && (
                      <div className="mt-2 text-xs text-red-500 flex items-start gap-1">
                        <AlertCircle size={12} className="mt-0.5" />
                        Target term not found in translation.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPanel;