import { GoogleGenAI, Type } from "@google/genai";
import { TranslationConfig, TranslationStyle, LegalDomain, GlossaryTerm, ComplianceReport, TranslationEngine } from "../types";
import { translateWithMarianMT } from "./huggingFaceService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System Glossaries (Pre-defined TM)
export const SYSTEM_GLOSSARIES: Record<LegalDomain, GlossaryTerm[]> = {
  [LegalDomain.GENERAL]: [],
  [LegalDomain.CONTRACTS]: [
    { id: 'c1', source: 'Rescisão', target: 'Termination', domain: LegalDomain.CONTRACTS },
    { id: 'c2', source: 'Dolo', target: 'Willful Misconduct', domain: LegalDomain.CONTRACTS },
    { id: 'c3', source: 'Culpa', target: 'Negligence', domain: LegalDomain.CONTRACTS },
    { id: 'c4', source: 'Foro', target: 'Venue', domain: LegalDomain.CONTRACTS },
    { id: 'c5', source: 'Objeto', target: 'Subject Matter', domain: LegalDomain.CONTRACTS },
  ],
  [LegalDomain.PENAL]: [
    { id: 'p1', source: 'Réu', target: 'Defendant', domain: LegalDomain.PENAL },
    { id: 'p2', source: 'Dolo', target: 'Intent/Malice', domain: LegalDomain.PENAL },
    { id: 'p3', source: 'Sentença', target: 'Judgment', domain: LegalDomain.PENAL },
    { id: 'p4', source: 'Habeas Corpus', target: 'Habeas Corpus', domain: LegalDomain.PENAL },
    { id: 'p5', source: 'Denúncia', target: 'Indictment/Complaint', domain: LegalDomain.PENAL },
  ],
  [LegalDomain.TAX]: [
    { id: 't1', source: 'Imposto de Renda', target: 'Income Tax', domain: LegalDomain.TAX },
    { id: 't2', source: 'Receita Federal', target: 'Internal Revenue Service (equivalent)', domain: LegalDomain.TAX },
    { id: 't3', source: 'Fato Gerador', target: 'Taxable Event', domain: LegalDomain.TAX },
    { id: 't4', source: 'Aliquota', target: 'Tax Rate', domain: LegalDomain.TAX },
    { id: 't5', source: 'Isenção', target: 'Exemption', domain: LegalDomain.TAX },
  ]
};

const BASE_STRUCTURE_PROMPT = `
# Sistema
Você é um tradutor especializado em documentos estruturados.
Sua prioridade absoluta é manter a INTEGRIDADE ESTRUTURAL do documento original.

# Regras Estritas de Layout (Checklist)
1. HEADINGS: Mantenha a mesma contagem, ordem e hierarquia de tags <H1>, <H2>, etc.
2. TABELAS: Mantenha tags <TAB[rXcY]> exatas. Não adicione nem remova células.
3. NOTAS DE RODAPÉ: Preserve tags <FOOTNOTE id="X"> com o ID exato.
4. REFERÊNCIAS: Mantenha <XREF target="X"> inalterado.

Nunca traduza atributos de tags (ex: id="1", target="§3").
Traduza apenas o conteúdo textual visível.
`;

const getStyleInstruction = (style: TranslationStyle): string => {
  switch (style) {
    case TranslationStyle.LEGAL:
      return `
# Modo: Jurídico
- Use terminologia legal precisa e estilo técnico, impessoal.
- Preserve citações legais e referências normativas rigorosamente.
- Mantenha o tom solene e a estrutura frasal típica de documentos legais.
- Traduza termos como "Agreement" para "Contrato" ou "Acordo" conforme o contexto jurídico da jurisdição alvo.`;
    
    case TranslationStyle.FORMAL:
      return `
# Modo: Formal Corporativo
- Use linguagem polida, frases longas e estruturadas.
- Evite gírias, contrações ou coloquialismos.
- Foco em clareza, profissionalismo e etiqueta corporativa.`;

    case TranslationStyle.ACADEMIC:
      return `
# Modo: Acadêmico
- Use estilo científico, rigor conceitual e objetividade.
- Preserve citações e referências bibliográficas exatas.
- Utilize vocabulário erudito e construções passivas quando apropriado.`;

    case TranslationStyle.COLLOQUIAL:
      return `
# Modo: Coloquial
- Use frases curtas, diretas e simples.
- Vocabulário acessível ao público geral.
- Permita contrações e expressões idiomáticas naturais.`;

    case TranslationStyle.MARKETING:
      return `
# Modo: Marketing
- Adapte culturalmente a mensagem para o público-alvo (transcriação).
- Preserve o impacto emocional e persuasivo.
- O estilo deve ser cativante, criativo e fluido, priorizando o efeito sobre a literalidade.`;
      
    default:
      return `
# Modo: Padrão
- Traduza com precisão e clareza, mantendo o tom do original.`;
  }
};

const getGlossaryInstruction = (domain: LegalDomain, customTerms: GlossaryTerm[]): string => {
  const systemTerms = SYSTEM_GLOSSARIES[domain] || [];
  const allTerms = [...systemTerms, ...customTerms];

  if (allTerms.length === 0) return "";

  const termList = allTerms
    .map(term => `- "${term.source}" -> "${term.target}"`)
    .join('\n');

  return `
# GLOSSÁRIO E TERMINOLOGIA (OBRIGATÓRIO)
Atenção: Você DEVE usar estritamente as seguintes traduções para os termos listados abaixo, ignorando outras variações, para manter a consistência com a Memória de Tradução (TM):

${termList}

Para termos não listados, use o vocabulário padrão da área de ${domain}.
`;
};

// Router Logic to determine engine
export const determineEngine = (config: TranslationConfig): TranslationEngine => {
  // ROUTING LOGIC:
  // If style is 'Jurídico' (Legal), strictly use MarianMT for rigid formatting and fixed glossary.
  // All other styles use Gemini (Contextual/Neural).
  
  if (config.style === TranslationStyle.LEGAL) {
      return TranslationEngine.MARIAN;
  }
  
  return TranslationEngine.GEMINI;
};

export const translateDocument = async (text: string, config: TranslationConfig): Promise<string> => {
  const engine = determineEngine(config);
  
  // If Engine is MarianMT, use the specialized service
  if (engine === TranslationEngine.MARIAN) {
    return translateWithMarianMT(text, config);
  }

  // Otherwise, use Gemini Orchestrator
  const styleInstruction = getStyleInstruction(config.style);
  const glossaryInstruction = getGlossaryInstruction(config.legalDomain, config.customTerms);
  
  const fullSystemPrompt = `${BASE_STRUCTURE_PROMPT}\n${styleInstruction}\n${glossaryInstruction}`;

  const prompt = `
# Variáveis configuráveis
- lang_src: ${config.sourceLang}
- lang_tgt: ${config.targetLang}
- jurisdiction_tgt: ${config.jurisdiction}
- style: ${config.style}
- format_numeric: ${config.formatNumeric}
- dateStyle: ${config.dateStyle}
- domain: ${config.legalDomain}

# Entrada
${text}
  `;

  // Adjust temperature based on style: creative styles get higher temperature
  const isCreative = config.style === TranslationStyle.MARKETING || config.style === TranslationStyle.COLLOQUIAL;
  const temperature = isCreative ? 0.4 : 0.1;

  try {
    const response = await ai.models.generateContent({
      model: config.model, 
      contents: prompt,
      config: {
        systemInstruction: fullSystemPrompt,
        temperature: temperature,
      }
    });

    return response.text || "Error: No translation generated.";
  } catch (error) {
    console.error("Translation error:", error);
    return "Error generating translation. Please check your API key and try again.";
  }
};

export const analyzeText = async (text: string, analysisType: 'summary' | 'risk' | 'format', lang: 'pt' | 'en' = 'en'): Promise<string> => {
  let instruction = "";

  if (lang === 'pt') {
    if (analysisType === 'summary') {
      instruction = "Resuma o texto jurídico a seguir de forma concisa para um advogado. Responda em Português do Brasil.";
    } else if (analysisType === 'risk') {
      instruction = "Analise o texto a seguir em busca de riscos jurídicos potenciais, ambiguidades, cláusulas leoninas ou desfavoráveis. Forneça uma lista estruturada dos riscos identificados. Responda em Português do Brasil.";
    } else if (analysisType === 'format') {
      instruction = "Verifique o texto a seguir quanto a inconsistências de formatação ou tags XML ausentes com base na estrutura do documento. Responda em Português.";
    }
  } else {
    // English defaults
    if (analysisType === 'summary') {
      instruction = "Summarize the following legal text concisely for a lawyer.";
    } else if (analysisType === 'risk') {
      instruction = "Analyze the following text for potential legal risks, ambiguities, or unfavorable clauses.";
    } else if (analysisType === 'format') {
      instruction = "Check the following text for formatting inconsistencies or missing tags based on a standard XML doc structure.";
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: instruction,
        temperature: 0.3,
      }
    });
    return response.text || "No analysis available.";
  } catch (error) {
    return "Error during analysis.";
  }
};

export const improveText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: "You are a specialized legal editor. Your task is to correct grammar, improve clarity, and ensure professional legal tone in the text provided. IMPORTANT: You must preserve all XML-like tags (e.g., <DOC>, <H1>, <P>) exactly as they appear. Do not remove or alter the tags. Only edit the text content within the tags.",
        temperature: 0.1,
      }
    });
    return response.text || text;
  } catch (error) {
    console.error("Improve text error:", error);
    return text;
  }
};

export const chatWithLegalBot = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        systemInstruction: "You are a helpful, professional legal assistant embedded in the LexiGen Translator app. You help users understand legal documents, terms, and clauses. You do not provide legal advice, but you explain concepts clearly."
      }
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};

export const auditTranslation = async (source: string, target: string): Promise<ComplianceReport> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `SOURCE DOCUMENT:\n${source}\n\nTARGET DOCUMENT:\n${target}`,
      config: {
        systemInstruction: `
          You are a strict QA Auditor for Structured Legal Documents.
          Compare the SOURCE and TARGET texts and verify the following Checklist:

          1. HEADINGS: Verify if <H1>, <H2>... tags match in count and order.
          2. TABLES: Verify if <TAB...> tags match in count and structure.
          3. FOOTNOTES: Verify if <FOOTNOTE id="..."> tags match exactly, including IDs.
          4. NUMBERS: Verify if dates, monetary amounts, and laws are accurate.
          5. TERMINOLOGY: Verify if key legal terms are translated consistently.
          
          Return a JSON object. For each failure, provide a clear message.
        `,
        responseMimeType: 'application/json',
        temperature: 0.1,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Compliance score 0-100" },
            summary: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { 
                    type: Type.STRING, 
                    enum: ['Headings', 'Tables', 'Footnotes', 'Numbers', 'Terminology', 'Completeness'] 
                  },
                  status: { type: Type.STRING, enum: ['pass', 'fail', 'warning'] },
                  message: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return json as ComplianceReport;
  } catch (error) {
    console.error("Audit error:", error);
    return {
      score: 0,
      summary: "Failed to generate audit report due to internal error.",
      items: []
    };
  }
};