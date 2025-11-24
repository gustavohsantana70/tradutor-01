
export enum TranslationStyle {
  LEGAL = 'Jurídico',
  FORMAL = 'Formal corporativo',
  ACADEMIC = 'Acadêmico',
  COLLOQUIAL = 'Coloquial',
  MARKETING = 'Marketing'
}

export enum DateStyle {
  JURISDICTION = 'jurisdiction',
  ISO = 'ISO',
  CUSTOM = 'custom'
}

export enum AIModel {
  GEMINI_3_PRO = 'gemini-3-pro-preview',
  GEMINI_2_5_FLASH = 'gemini-2.5-flash'
}

export enum TranslationEngine {
  GEMINI = 'Gemini Neural (Contextual)',
  MARIAN = 'MarianMT (Rigid/Strict)'
}

export enum LegalDomain {
  GENERAL = 'General/Civil',
  CONTRACTS = 'Contracts/Corporate',
  PENAL = 'Criminal Law',
  TAX = 'Tax/Fiscal'
}

export const SUPPORTED_LANGUAGES = [
  { code: 'pt-BR', name: 'Portuguese (BR)' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish (ES)' },
  { code: 'fr-FR', name: 'French (FR)' },
  { code: 'de-DE', name: 'German (DE)' },
  { code: 'it-IT', name: 'Italian (IT)' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'nl-NL', name: 'Dutch' },
  { code: 'tr-TR', name: 'Turkish' },
  { code: 'pl-PL', name: 'Polish' },
  { code: 'sv-SE', name: 'Swedish' },
  { code: 'hi-IN', name: 'Hindi' }
];

export interface GlossaryTerm {
  id: string;
  source: string;
  target: string;
  domain: LegalDomain | 'Custom';
}

export interface TranslationConfig {
  sourceLang: string;
  targetLang: string;
  jurisdiction: string;
  style: TranslationStyle;
  formatNumeric: boolean;
  dateStyle: DateStyle;
  model: AIModel;
  legalDomain: LegalDomain;
  activeEngine: TranslationEngine;
  customTerms: GlossaryTerm[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppMode {
  TRANSLATE = 'translate',
  CHAT = 'chat'
}

export interface AuthUser {
  email: string;
  token: string;
  name: string;
}

export type ComplianceCategory = 'Headings' | 'Tables' | 'Footnotes' | 'Numbers' | 'Terminology' | 'Completeness';

export interface ComplianceItem {
  id: string;
  category: ComplianceCategory;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export interface ComplianceReport {
  score: number; // 0 to 100
  items: ComplianceItem[];
  summary: string;
}

export interface WebhookConfig {
  url: string;
  active: boolean;
  events: ('translation.completed' | 'compliance.failed')[];
  secret: string;
}

export interface ApiLog {
  id: string;
  timestamp: Date;
  method: 'POST' | 'GET' | 'WEBHOOK';
  endpoint: string;
  status: number;
  latency: string;
}

export type UILanguage = 'pt' | 'en';
