
import React, { useState, useEffect } from 'react';
import { TranslationConfig, TranslationStyle, DateStyle, AIModel, LegalDomain, GlossaryTerm, ComplianceReport, TranslationEngine, SUPPORTED_LANGUAGES, UILanguage } from '../types';
import { translateDocument, analyzeText, improveText, auditTranslation, determineEngine } from '../services/geminiService';
import { ArrowRight, FileText, Zap, AlertTriangle, CheckCircle, Copy, Loader2, Play, Sparkles, Book, ShieldCheck, Eye, Cpu } from 'lucide-react';
import GlossaryManager from './GlossaryManager';
import CompliancePanel from './CompliancePanel';
import ReviewPanel from './ReviewPanel';
import FileUploader from './FileUploader';
import { LABELS, getDomainLabel } from '../services/localizationService';

interface TranslatorProps {
  config: TranslationConfig;
  setConfig: React.Dispatch<React.SetStateAction<TranslationConfig>>;
  uiLang: UILanguage;
}

const Translator: React.FC<TranslatorProps> = ({ config, setConfig, uiLang }) => {
  const t = LABELS[uiLang];
  
  const [sourceText, setSourceText] = useState<string>(`<DOC lang_src="pt-BR" lang_tgt="en-US" jurisdiction_tgt="US" style="jurídico">
<H1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</H1>
<P style="BodyText">As partes abaixo identificadas...</P>
<TAB[r1c1]>Objeto</TAB>
<TAB[r1c2]>Prestação de serviços...</TAB>
<FOOTNOTE id="1">Vide cláusula 3.2.</FOOTNOTE>
<P>Conforme disposto no <XREF target="§3">parágrafo terceiro</XREF>, o prazo é de 12 meses.</P>
</DOC>`);
  const [targetText, setTargetText] = useState<string>(`<DOC lang_src="pt-BR" lang_tgt="en-US" jurisdiction_tgt="US" style="jurídico">
<H1>SERVICE AGREEMENT</H1>
<P style="BodyText">The parties identified below...</P>
<TAB[r1c1]>Subject Matter</TAB>
<TAB[r1c2]>Provision of services...</TAB>
<FOOTNOTE id="1">See clause 3.2.</FOOTNOTE>
<P>As provided in <XREF target="§3">paragraph three</XREF>, the term is 12 months.</P>
</DOC>`);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  
  const [analysisResult, setAnalysisResult] = useState<{ type: string, content: string } | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(true);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);

  // Auto-update engine based on selection
  useEffect(() => {
    const engine = determineEngine(config);
    if (engine !== config.activeEngine) {
      setConfig(prev => ({ ...prev, activeEngine: engine }));
    }
  }, [config.legalDomain, config.style, config.activeEngine, setConfig]);

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
        uiLang={uiLang}
      />

      {isReviewOpen && (
        <ReviewPanel 
          sourceText={sourceText} 
          targetText={targetText} 
          config={config} 
          onClose={() => setIsReviewOpen(false)}
          uiLang={uiLang} 
        />
      )}

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm z-10">
        <div className="flex gap-4 items-center flex-wrap">
          
          {/* Source Language */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 font-semibold uppercase mb-1">{t.source}</label>
            <select
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[200px] text-gray-900"
              value={config.sourceLang}
              onChange={(e) => setConfig({ ...config, sourceLang: e.target.value })}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
             <div className="h-full flex items-end pb-2 text-gray-400">
               <ArrowRight size={16} />
             </div>
          </div>

          {/* Target Language */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 font-semibold uppercase mb-1">{t.target}</label>
            <select
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[200px] text-gray-900"
              value={config.targetLang}
              onChange={(e) => setConfig({ ...config, targetLang: e.target.value })}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div className="h-10 w-px bg-gray-200 mx-2 hidden sm:block"></div>

          <div className="flex flex-col">
             <label className="text-xs text-gray-500 font-semibold uppercase mb-1">{t.legalDomain}</label>
             <select
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[300px] text-gray-900"
              value={config.legalDomain}
              onChange={(e) => setConfig({ ...config, legalDomain: e.target.value as LegalDomain })}
            >
              {Object.values(LegalDomain).map((d) => (
                <option key={d} value={d}>{getDomainLabel(d, uiLang)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 font-semibold uppercase mb-1">{t.style}</label>
            <select
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[220px] text-gray-900"
              value={config.style}
              onChange={(e) => setConfig({ ...config, style: e.target.value as TranslationStyle })}
            >
              {Object.values(TranslationStyle).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
             <label className="text-xs text-gray-500 font-semibold uppercase mb-1">{t.engine}</label>
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-medium ${
               config.activeEngine === TranslationEngine.MARIAN 
               ? 'bg-purple-50 border-purple-200 text-purple-700' 
               : 'bg-indigo-50 border-indigo-200 text-indigo-700'
             }`}>
               <Cpu size={14} />
               <span>{config.activeEngine === TranslationEngine.MARIAN ? t.engineMarian : t.engineGemini}</span>
             </div>
          </div>
        </div>

        <div className="flex gap-2 items-center mt-2 lg:mt-0">
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="flex items-center gap-1 px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors border border-gray-300 mr-2"
              title={t.glossary}
            >
              <Book size={14} />
              <span className="hidden sm:inline">{t.glossary}</span>
              {config.customTerms.length > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] px-1.5 rounded-full ml-1">{config.customTerms.length}</span>
              )}
            </button>

            <button
                onClick={() => handleAnalyze('risk')}
                className="flex items-center gap-1 px-3 py-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded text-sm font-medium transition-colors"
                disabled={isAnalyzing}
            >
                <AlertTriangle size={14} /> <span className="hidden sm:inline">{t.risk}</span>
            </button>
             <button
                onClick={() => handleAnalyze('summary')}
                className="flex items-center gap-1 px-3 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded text-sm font-medium transition-colors"
                disabled={isAnalyzing}
            >
                <FileText size={14} /> <span className="hidden sm:inline">{t.summary}</span>
            </button>
            <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className={`flex items-center gap-2 text-white px-4 py-2 rounded-md transition-colors font-medium shadow-sm disabled:opacity-50 ml-2 ${
                  config.activeEngine === TranslationEngine.MARIAN ? 'bg-purple-600 hover:bg-purple-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
            >
                {isTranslating ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                {t.translate}
            </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Source */}
        <div className="flex-1 flex flex-col border-r border-gray-200 bg-gray-50/50">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t.sourceDoc} ({config.sourceLang})</span>
            <div className="flex items-center gap-2">
                 <button
                    onClick={handlePolish}
                    disabled={isPolishing || !sourceText}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 transition-colors"
                    title={t.polish}
                >
                    {isPolishing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {t.polish}
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <button onClick={() => setSourceText('')} className="text-xs text-gray-400 hover:text-red-500">{t.clear}</button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <FileUploader onFileLoaded={handleFileLoad} uiLang={uiLang} />
            <textarea
              className="flex-1 p-4 rounded-lg border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-sm leading-relaxed custom-scrollbar text-gray-800 bg-white"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Target */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{t.targetDoc} ({config.targetLang})</span>
            <div className="flex items-center gap-2">
                {targetText && (
                  <>
                     <button 
                        onClick={() => setIsReviewOpen(true)}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors mr-2"
                        title={t.review}
                      >
                         <Eye size={12} />
                         {t.review}
                     </button>
                     <div className="h-4 w-px bg-gray-300 mx-1"></div>
                     <button 
                        onClick={handleAudit} 
                        disabled={isAuditing}
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium disabled:opacity-50 transition-colors mr-2"
                        title={t.audit}
                      >
                         {isAuditing ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                         {t.audit}
                     </button>
                     <div className="h-4 w-px bg-gray-300 mx-1"></div>
                     <button onClick={() => copyToClipboard(targetText)} className="text-gray-400 hover:text-indigo-600 transition-colors" title={t.copy}>
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
              />
              {isTranslating && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100 flex flex-col items-center">
                          <Loader2 className={`animate-spin mb-2 ${config.activeEngine === TranslationEngine.MARIAN ? 'text-purple-600' : 'text-indigo-600'}`} size={32} />
                          <span className="text-sm font-medium text-gray-600">{t.processing} {config.activeEngine === TranslationEngine.MARIAN ? t.engineMarian : t.engineGemini}...</span>
                          <span className="text-xs text-gray-400 mt-1">{t.applyingGlossary} {getDomainLabel(config.legalDomain, uiLang)}</span>
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
                    {analysisResult.type === 'risk' ? t.riskAnalysis : t.summaryAnalysis}
                 </h3>
                 <button onClick={() => setAnalysisResult(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
             </div>
             <div className="p-4 overflow-y-auto font-sans text-sm text-gray-600 leading-relaxed custom-scrollbar">
                {analysisResult.content}
             </div>
          </div>
      )}

      {complianceReport && (
        <CompliancePanel 
          report={complianceReport} 
          onClose={() => setComplianceReport(null)} 
          uiLang={uiLang}
        />
      )}
    </div>
  );
};

export default Translator;
