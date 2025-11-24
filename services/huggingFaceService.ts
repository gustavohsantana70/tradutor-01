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
    *** ENGINE SWITCHED: MARIAN-MT SIMULATION ***
    Target Model: Helsinki-NLP/opus-mt-pt-en
    Behavior: Strict, Rigid, Glossary-Enforced.

    TASK: Translate strictly.
    SOURCE: ${config.sourceLang}
    TARGET: ${config.targetLang}
    
    CRITICAL INSTRUCTIONS:
    1. USE THE GLOSSARY BELOW ABSOLUTELY.
    2. PRESERVE ALL TAGS (H1, TAB, FOOTNOTE) EXACTLY.
    3. DO NOT IMPROVE STYLE. BE LITERAL AND ACCURATE.
    
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