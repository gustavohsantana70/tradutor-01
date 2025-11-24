import React, { useState } from 'react';
import { TranslationConfig, TranslationStyle, DateStyle, AIModel, LegalDomain, GlossaryTerm, ComplianceReport } from '../types';
import { translateDocument, analyzeText, improveText, auditTranslation } from '../services/geminiService';
import { ArrowRight, FileText, Zap, AlertTriangle, CheckCircle, Copy, Loader2, Play, Sparkles, Book, ShieldCheck } from 'lucide-react';
import GlossaryManager from './GlossaryManager';
import CompliancePanel from './CompliancePanel';
import FileUploader from './FileUploader';

interface TranslatorProps {
  config: TranslationConfig;
  setConfig: React.Dispatch<React.SetStateAction<TranslationConfig>>;
}

const Translator: React.FC<TranslatorProps> = ({ config, setConfig }) => {
  const [sourceText, setSourceText] = useState<string>(`<DOC lang_src="pt-BR" lang_tgt="en-US" jurisdiction_tgt="US" style="jurídico">
<H1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</H1>
<P style="BodyText">As partes abaixo identificadas...</P>
<TAB[r1c1]>Objeto</TAB>
<TAB[r1c2]>Prestação de serviços...</TAB>
<FOOTNOTE id="1">Vide cláusula 3.2.</FOOTNOTE>
<P>Conforme disposto no <XREF target="§3">parágrafo terceiro</XREF>, o prazo é de 12 meses.</P>
</DOC>`);
  const [targetText, setTargetText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  
  const [analysisResult, setAnalysisResult] = useState<{ type: string, content: string } | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);

  const handleTranslate = async () => {
    setIsTranslating(true);
    setAnalysisResult(null);
    setComplianceReport(null);
    const result = await translateDocument(sourceText, config);
    setTargetText(result);
    setIsTranslating(false);
  };

  const handleAnalyze = async (type: 'summary' | 'risk' | 'format') => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    const result = await analyzeText(sourceText, type);
    setAnalysisResult({ type, content: result });
    setIsAnalyzing(false);
  };

  const handlePolish = async () => {
    setIsPolishing(true);
    const result = await improveText(sourceText);
    setSourceText(result);
    setIsPolishing(false);
  };

  const handleAudit = async () => {
    if (!sourceText || !targetText) return;
    setIsAuditing(true);
    const report = await auditTranslation(sourceText, targetText);
    setComplianceReport(report);
    setIsAuditing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const setCustomTerms = (terms: GlossaryTerm[]) => {
    setConfig({ ...config, customTerms: terms });
  };

  const handleFileLoad = (content: string) => {
    setSourceText(content);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <GlossaryManager 
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        legalDomain={config.legalDomain}
        customTerms={config.customTerms}
        setCustomTerms={setCustomTerms}
      />

      {complianceReport && (
        <CompliancePanel 
          report={complianceReport} 
          onClose={() => setComplianceReport(null)} 
        />
      )}

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm z-10">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex flex-col">
             <label className="text-xs text-gray-500 font-semibold uppercase">AI Model</label>
             <select
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-32 md:w-48"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value as AIModel })}
            >
              <option value={AIModel.GEMINI_3_PRO}>Gemini 3 Pro (High Quality)</option>
              <option value={AIModel.GEMINI_2_5_FLASH}>Gemini 2.5 Flash (Fast)</option>
            </select>
          </div>

          <div className="flex flex-col">
             <label className="text-xs text-gray-500 font-semibold uppercase">Legal Domain</label>
             <select
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-36"
              value={config.legalDomain}
              onChange={(e) => setConfig({ ...config, legalDomain: e.target.value as LegalDomain })}
            >
              {Object.values(LegalDomain).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 font-semibold uppercase">Style</label>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={config.style}
              onChange={(e) => setConfig({ ...config, style: e.target.value as TranslationStyle })}
            >
              {Object.values(TranslationStyle).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
             <label className="text-xs text-gray-500 font-semibold uppercase">Target</label>
             <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1 text-sm w-16 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={config.targetLang}
              onChange={(e) => setConfig({ ...config, targetLang: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-2 items-center">
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors border border-gray-300 mr-2"
              title="Manage Glossary & TM"
            >
              <Book size={14} />
              <span className="hidden sm:inline">Glossary</span>
              {config.customTerms.length > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] px-1.5 rounded-full ml-1">{config.customTerms.length}</span>
              )}
            </button>

            <button
                onClick={() => handleAnalyze('risk')}
                className="flex items-center gap-1 px-3 py-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded text-sm font-medium transition-colors"
                disabled={isAnalyzing}
            >
                <AlertTriangle size={14} /> <span className="hidden sm:inline">Risk</span>
            </button>
             <button
                onClick={() => handleAnalyze('summary')}
                className="flex items-center gap-1 px-3 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded text-sm font-medium transition-colors"
                disabled={isAnalyzing}
            >
                <FileText size={14} /> <span className="hidden sm:inline">Summary</span>
            </button>
            <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-50 ml-2"
            >
                {isTranslating ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                Translate
            </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Source */}
        <div className="flex-1 flex flex-col border-r border-gray-200 bg-gray-50/50">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Source Document ({config.sourceLang})</span>
            <div className="flex items-center gap-2">
                 <button
                    onClick={handlePolish}
                    disabled={isPolishing || !sourceText}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 transition-colors"
                    title="AI Polish"
                >
                    {isPolishing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Polish
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <button onClick={() => setSourceText('')} className="text-xs text-gray-400 hover:text-red-500">Clear</button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <FileUploader onFileLoaded={handleFileLoad} />
            <textarea
              className="flex-1 p-4 rounded-lg border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-sm leading-relaxed custom-scrollbar text-gray-800 bg-white"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste text here or upload a document above..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Target */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Target Document ({config.targetLang})</span>
            <div className="flex items-center gap-2">
                {targetText && (
                  <>
                     <button 
                        onClick={handleAudit} 
                        disabled={isAuditing}
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium disabled:opacity-50 transition-colors mr-2"
                      >
                         {isAuditing ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                         Verify Compliance
                     </button>
                     <div className="h-4 w-px bg-gray-300 mx-1"></div>
                     <button onClick={() => copyToClipboard(targetText)} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Copy">
                        <Copy size={14} />
                     </button>
                  </>
                )}
            </div>
          </div>
          <div className="flex-1 relative">
             <textarea
                className="w-full h-full p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed custom-scrollbar text-gray-800 bg-indigo-50/10"
                value={targetText}
                readOnly
                placeholder="Translation will appear here..."
              />
              {isTranslating && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100 flex flex-col items-center">
                          <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
                          <span className="text-sm font-medium text-gray-600">Processing with {config.model}...</span>
                          <span className="text-xs text-gray-400 mt-1">Applying {config.legalDomain} glossary</span>
                      </div>
                  </div>
              )}
          </div>
        </div>
      </div>

      {/* Analysis Overlay */}
      {analysisResult && (
          <div className="h-48 border-t border-gray-200 bg-white flex flex-col">
             <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                 <h3 className="text-sm font-bold text-gray-700 capitalize flex items-center gap-2">
                    {analysisResult.type === 'risk' ? <AlertTriangle size={14} className="text-amber-500"/> : <Zap size={14} className="text-blue-500"/>}
                    {analysisResult.type} Analysis
                 </h3>
                 <button onClick={() => setAnalysisResult(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
             </div>
             <div className="p-4 overflow-y-auto font-sans text-sm text-gray-600 leading-relaxed custom-scrollbar">
                {analysisResult.content}
             </div>
          </div>
      )}
    </div>
  );
};

export default Translator;