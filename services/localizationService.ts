
import { UILanguage, LegalDomain, TranslationStyle } from '../types';

export const LABELS = {
  pt: {
    appTitle: "Tradutor LexiGen",
    appSubtitle: "Localização Jurídica com IA",
    source: "Origem",
    target: "Destino",
    legalDomain: "Área Jurídica",
    style: "Estilo",
    engine: "Motor (Auto)",
    glossary: "Glossário",
    risk: "Risco",
    summary: "Resumo",
    translate: "Traduzir",
    polish: "Polir IA",
    clear: "Limpar",
    review: "Revisar",
    audit: "Auditar",
    copy: "Copiar",
    loginTitle: "Login Seguro",
    email: "E-mail",
    password: "Senha",
    loginBtn: "Entrar",
    loginFooter: "Protegido por Autenticação JWT Corporativa.",
    developer: "Desenvolvedor",
    logout: "Sair",
    processing: "Processando com",
    applyingGlossary: "Aplicando glossário de",
    uploadDrop: "Arraste a petição aqui",
    uploadBtn: "Carregar Petição ou Contrato",
    uploadFormats: "Suporta XML, TXT, JSON. (PDF/DOCX simulado)",
    extracting: "Extraindo conteúdo de",
    loaded: "carregado",
    uploadAnother: "Carregar outro arquivo",
    riskAnalysis: "Análise de Risco",
    summaryAnalysis: "Resumo",
    close: "Fechar",
    sourceDoc: "Documento Original",
    targetDoc: "Documento Traduzido",
    engineMarian: "MarianMT (Rígido)",
    engineGemini: "Gemini Neural",
    glossaryManage: "Gerenciar Glossário & TM",
    glossarySystem: "Sistema",
    glossaryCustom: "Meus Termos (TM)",
    glossarySource: "Fonte",
    glossaryTarget: "Alvo",
    glossaryAdd: "Adicionar",
    glossaryEmpty: "Nenhum termo personalizado.",
    saveClose: "Salvar & Fechar",
    auditReport: "Relatório de Integridade",
    auditChecklist: "Checklist de Auditoria",
    confidence: "Índice de Confiança",
    closeReport: "Fechar Relatório",
    welcomeChat: "Olá. Sou seu assistente de tradução jurídica. Como posso ajudar com seu documento hoje?",
    typeMessage: "Pergunte sobre termos jurídicos...",
    chatTitle: "Assistente Jurídico"
  },
  en: {
    appTitle: "LexiGen Translator",
    appSubtitle: "AI Powered Legal Localization",
    source: "Source",
    target: "Target",
    legalDomain: "Legal Domain",
    style: "Style",
    engine: "Engine (Auto)",
    glossary: "Glossary",
    risk: "Risk",
    summary: "Summary",
    translate: "Translate",
    polish: "Polish",
    clear: "Clear",
    review: "Review",
    audit: "Audit",
    copy: "Copy",
    loginTitle: "Secure Login",
    email: "Email Address",
    password: "Password",
    loginBtn: "Secure Login",
    loginFooter: "Protected by Enterprise JWT Authentication.",
    developer: "Developer",
    logout: "Logout",
    processing: "Processing with",
    applyingGlossary: "Applying glossary for",
    uploadDrop: "Drop petition here",
    uploadBtn: "Upload Petition or Contract",
    uploadFormats: "Supports XML, TXT, JSON. (PDF/DOCX simulated)",
    extracting: "Extracting content from",
    loaded: "loaded",
    uploadAnother: "Upload another file",
    riskAnalysis: "Risk Analysis",
    summaryAnalysis: "Summary Analysis",
    close: "Close",
    sourceDoc: "Source Document",
    targetDoc: "Target Document",
    engineMarian: "MarianMT (Rigid)",
    engineGemini: "Gemini Neural",
    glossaryManage: "Glossary & Termbase Manager",
    glossarySystem: "System",
    glossaryCustom: "My Custom Terms (TM)",
    glossarySource: "Source",
    glossaryTarget: "Target",
    glossaryAdd: "Add",
    glossaryEmpty: "No custom terms added.",
    saveClose: "Save & Close",
    auditReport: "Integrity & Compliance Report",
    auditChecklist: "Audit Checklist",
    confidence: "Confidence Score",
    closeReport: "Close Report",
    welcomeChat: "Hello. I am your legal translation assistant. How can I help you with your document today?",
    typeMessage: "Ask about legal terms...",
    chatTitle: "Legal Assistant"
  }
};

export const getDomainLabel = (domain: LegalDomain, lang: UILanguage): string => {
  if (lang === 'en') return domain;
  
  switch (domain) {
    case LegalDomain.GENERAL: return 'Geral/Cível';
    case LegalDomain.CONTRACTS: return 'Contratos/Corporativo';
    case LegalDomain.PENAL: return 'Direito Penal';
    case LegalDomain.TAX: return 'Tributário/Fiscal';
    default: return domain;
  }
};

export const getStyleLabel = (style: TranslationStyle, lang: UILanguage): string => {
  // Styles are already stored as localized strings in the Enum (Portuguese base), 
  // but if we needed to map them to EN we would do it here. 
  // Since the user wants the App in PT, and the enum IS PT, we use it directly or map if needed.
  return style; 
};
