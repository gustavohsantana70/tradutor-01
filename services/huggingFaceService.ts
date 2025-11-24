import { GoogleGenAI } from "@google/genai";
import { TranslationConfig } from "../types";
import { SYSTEM_GLOSSARIES } from "./geminiService";

// SIMULATION of Hugging Face MarianMT Endpoint
// Target Model: Helsinki-NLP/opus-mt-pt-en
// We simulate the behavior of a Rigid NMT model using a very strict prompt.

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const translateWithMarianMT = async (text: string, config: TranslationConfig): Promise<string> => {
  const systemTerms = SYSTEM_GLOSSARIES[config.legalDomain] || [];
  const allTerms = [...systemTerms, ...config.customTerms];
  
  const glossaryMap = allTerms.map(t => `${t.source} -> ${t.target}`).join('\n');

  const prompt = `
    *** ENGINE SWITCHED: MARIAN-MT (Helsinki-NLP/opus-mt-pt-en) ***
    Target Behavior: Rigid Neural Machine Translation (NMT).
    
    TASK: Translate strictly from ${config.sourceLang} to ${config.targetLang}.
    
    CRITICAL NMT RULES:
    1. STRICT GLOSSARY ENFORCEMENT: You MUST use the provided glossary terms below. No synonyms.
    2. PRESERVE TAGS EXACTLY: All XML tags (<H1>, <TAB>, <FOOTNOTE>) must remain in the output exactly as they are in the input.
    3. LITERAL STYLE: Do not attempt to be "creative" or "natural" if it sacrifices accuracy. Be dry and precise, typical of standard NMT output for legal texts.
    
    GLOSSARY:
    ${glossaryMap}

    INPUT TEXT:
    ${text}
  `;

  try {
    // We use Flash with 0 temperature to mimic the deterministic nature of NMT models
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
      config: {
        temperature: 0.0, 
        maxOutputTokens: 8192,
      }
    });

    return response.text || "MarianMT Error";
  } catch (error) {
    console.error("MarianMT Simulation Error:", error);
    return "Error in MarianMT Engine.";
  }
};