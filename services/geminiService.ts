import { GoogleGenAI, Tool } from "@google/genai";
import { IntelligenceMode, GroundingSource } from '../types';

interface GenerationResult {
  text: string;
  sources: GroundingSource[];
}

const getSystemInstruction = (mode: IntelligenceMode): string => {
  const base = "You are Gream Bvddy, an advanced personal AI research assistant.";
  
  switch (mode) {
    case IntelligenceMode.SUMMARY:
      return `${base} MODE: SUMMARY. Provide concise, high-level overviews. Use bullet points. Maximum brevity. Focus on key facts only.`;
    case IntelligenceMode.EXPLANATION:
      return `${base} MODE: EXPLANATION. Explain concepts clearly and simply. Use analogies suitable for a beginner. Avoid heavy jargon unless defined.`;
    case IntelligenceMode.DETAILED:
      return `${base} MODE: DETAILED. Provide deep technical breakdowns, step-by-step guides, and comprehensive context. Use code blocks where relevant. Structured output is preferred.`;
    case IntelligenceMode.POPULAR:
      return `${base} MODE: POPULAR. Focus on general public perception, trending opinions, and common consensus. Explain how the topic is understood by the majority.`;
    case IntelligenceMode.HALLUCIN:
      return `${base} MODE: HALLUCIN/IMAGINE. You are now a speculative engine. Generate creative, futuristic, or abstract interpretations. You are NOT bound by current facts, but you MUST label your output as speculative. Be bold and imaginative.`;
    default:
      return base;
  }
};

export const generateGeminiResponse = async (
  prompt: string,
  mode: IntelligenceMode,
  history: { role: string; content: string }[] = []
): Promise<GenerationResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key required");

  const ai = new GoogleGenAI({ apiKey });
  
  // Configure tools based on mode. Hallucin might not need search, but others do.
  const tools: Tool[] = [];
  
  // We enable search for all modes except maybe Hallucin if we want pure creativity, 
  // but even Hallucin works better with some context. Let's keep it generally available
  // but the model might choose not to use it if prompt is abstract.
  if (mode !== IntelligenceMode.HALLUCIN) {
    tools.push({ googleSearch: {} });
  }

  const systemInstruction = getSystemInstruction(mode);

  // Adjust creativity based on mode
  let temperature = 0.7;
  if (mode === IntelligenceMode.SUMMARY) temperature = 0.3;
  if (mode === IntelligenceMode.DETAILED) temperature = 0.4;
  if (mode === IntelligenceMode.HALLUCIN) temperature = 1.2; // High creativity

  try {
    // Use gemini-3-pro-preview for complex tasks (Detailed) and creative tasks (Hallucin)
    // Use gemini-2.5-flash for basic text tasks (Summary, Explanation, Popular)
    const modelId = (mode === IntelligenceMode.DETAILED || mode === IntelligenceMode.HALLUCIN)
      ? 'gemini-3-pro-preview'
      : 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        ...history.map(h => ({
          role: h.role,
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        temperature,
        tools: tools.length > 0 ? tools : undefined,
      }
    });

    const text = response.text || "No response generated.";
    
    // Extract grounding metadata
    let sources: GroundingSource[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks) {
      sources = groundingChunks
        .filter((c: any) => c.web?.uri && c.web?.title)
        .map((c: any) => ({
          title: c.web.title,
          uri: c.web.uri
        }));
    }

    return { text, sources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
