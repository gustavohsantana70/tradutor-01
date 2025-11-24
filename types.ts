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

export enum LegalDomain {
  GENERAL = 'General/Civil',
  CONTRACTS = 'Contracts/Corporate',
  PENAL = 'Criminal Law',
  TAX = 'Tax/Fiscal'
}

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