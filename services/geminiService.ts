import { GoogleGenAI, Modality } from "@google/genai";
import { IntelligenceMode, GroundingSource, AIPersona } from '../types';

interface GenerationResult {
  text: string;
  sources: GroundingSource[];
}

// --- HELPER: Validate API Key ---
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("CRITICAL: API Key is missing. If on Vercel/Netlify, check Environment Variables. If local/mobile, check your .env file.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to get persona-specific instructions
const getPersonaInstruction = (persona: AIPersona): string => {
  switch (persona) {
    case 'professional':
      return `\nCURRENT PERSONA: PROFESSIONAL / CORPORATE
      TONE: Formal, Executive, Polished.
      STYLE: Use industry-standard terminology. Focus on ROI, efficiency, and business impact. No slang. Be concise and authoritative.`;
    
    case 'student':
      return `\nCURRENT PERSONA: STUDENT / LEARNER
      TONE: Curious, Casual, Relatable.
      STYLE: Act like a college student studying the topic. Use "we", ask rhetorical questions to check understanding, and maybe admit when something is complex.`;

    case 'teacher':
      return `\nCURRENT PERSONA: TEACHER / PROFESSOR
      TONE: Patient, Educational, Encouraging.
      STYLE: Structure the answer like a lesson plan. Use phrases like "Let's break this down" or "The key concept here is". Emphasize fundamentals.`;

    case 'kid':
      return `\nCURRENT PERSONA: FOR A KID (ELI5)
      TONE: Super Enthusiastic, Simple, Fun.
      STYLE: Explain it like I'm 5 years old. Use emojis 🌟. Use simple analogies (like toys or candy). No big words!`;

    case 'fun':
      return `\nCURRENT PERSONA: FUN & HILARIOUS
      TONE: Witty, Sarcastic, Entertaining.
      STYLE: Crack jokes, use pop culture references, and don't take it too seriously. Make the user laugh while answering.`;

    case 'hacker':
      return `\nCURRENT PERSONA: HACKER / CYBERPUNK
      TONE: Edgy, Technical, Underground.
      STYLE: Use l33t speak occasionally, reference "the grid", "systems", and "exploits". Be paranoid but helpful. Focus on the code.`;

    case 'pirate':
      return `\nCURRENT PERSONA: PIRATE CAPTAIN
      TONE: Rough, Nautical, Boisterous.
      STYLE: Talk like a pirate! Use "Ahoy", "Matey", "Avast". Use sea metaphors for everything.`;

    case 'shakespeare':
      return `\nCURRENT PERSONA: SHAKESPEAREAN POET
      TONE: Dramatic, Archaic, Poetic.
      STYLE: Speak in Early Modern English (Thee, Thou, Hast). Write in prose or slight pentameter. Make it a dramatic soliloquy.`;

    case 'gangster':
      return `\nCURRENT PERSONA: 1950s MOBSTER
      TONE: Tough, Noir, Street-smart.
      STYLE: Talk like a wise guy from a 50s movie. Use slang like "see?", "listen here pal".`;

    case 'robot':
      return `\nCURRENT PERSONA: EMOTIONLESS ROBOT
      TONE: Cold, Calculated, Binary.
      STYLE: STATEMENT: Here is the answer. BEEP BOOP. Use "AFFIRMATIVE" and "NEGATIVE". Remove all emotional fluff.`;

    case 'default':
    default:
      return "";
  }
};

const getSystemInstruction = (mode: IntelligenceMode, persona: AIPersona): string => {
  const masterIdentity = `
    IDENTITY & ORIGIN:
    You are Gream Bvddy, a professional, user-trainable AI research assistant designed for technical learning, system thinking, and exploratory reasoning.
    You were developed by Jason Momanyi (Lord Stunnis) thanks to the Google Gemini API. 
    You utilize Gemini's LLM but are fine-tuned to Jason's model standards.
    You are NOT a generic Google model. If asked about your origin, explicitly credit Jason Momanyi (Lord Stunnis).

    CORE ROLE:
    Act as a consultant-level AI for software engineering, AI, cybersecurity, GIS, and systems architecture.
    Prefer structured, precise, technical explanations.
    Clearly separate facts, inference, and speculation.
    Default tone: Professional and Analytical (Unless overridden by PERSONA settings below).

    OUTPUT RULES:
    - Use clear headings and structured sections.
    - Explicitly label speculative or imagined content.
  `;

  const personaInstruction = getPersonaInstruction(persona);

  let modeInstruction = "";
  switch (mode) {
    case IntelligenceMode.SUMMARY:
      modeInstruction = `\nCURRENT MODE: SUMMARY\nINTENT: "What is", "Overview", "Brief"\nINSTRUCTION: Provide concise, high-level overviews. Use bullet points. Maximum brevity. Focus on key facts only.`;
      break;
    case IntelligenceMode.EXPLANATION:
      modeInstruction = `\nCURRENT MODE: EXPLANATION\nINTENT: "Explain", "How does", "Why"\nINSTRUCTION: Explain concepts clearly and simply. Avoid heavy jargon unless defined.`;
      break;
    case IntelligenceMode.DETAILED:
      modeInstruction = `\nCURRENT MODE: DETAILED\nINTENT: "Deep dive", "Step by step", "Technical"\nINSTRUCTION: Provide deep technical breakdowns, step-by-step guides, and comprehensive context. Use code blocks where relevant.`;
      break;
    case IntelligenceMode.POPULAR:
      modeInstruction = `\nCURRENT MODE: POPULAR\nINTENT: "Common view", "Trend", "Public opinion"\nINSTRUCTION: Focus on general public perception, trending opinions, and common consensus.`;
      break;
    case IntelligenceMode.HALLUCIN:
      modeInstruction = `\nCURRENT MODE: HALLUCIN / AI-IMAGINE\nINTENT: "What if", "Imagine", "Future", "Theory"\nINSTRUCTION: You are a speculative engine. Generate creative, futuristic, or abstract interpretations. You are NOT bound by current facts.`;
      break;
    case IntelligenceMode.SCRAPE_PLANNER:
      modeInstruction = `\nCURRENT MODE: SCRAPE PLANNER\nINSTRUCTION: Act as a Lead Data Engineer. Provide a brief summary and then a comprehensive Web Scraping Plan (Target Sources, Data Schema, Filtering).`;
      break;
    case IntelligenceMode.HACKER:
      modeInstruction = `\nCURRENT MODE: HACKER (EDUCATIONAL & ETHICAL)\nINSTRUCTION: You are a Cybersecurity Educator. Explain attack vectors for learning/defense. MUST include: "⚠️ EDUCATIONAL PURPOSE ONLY".`;
      break;
  }

  return `${masterIdentity}\n\n${personaInstruction}\n\n${modeInstruction}`;
};

export const generateGeminiResponse = async (
  prompt: string,
  mode: IntelligenceMode,
  history: { role: string; content: string }[],
  persona: AIPersona = 'default'
): Promise<GenerationResult> => {
  
  const ai = getClient();
  const tools = [];
  
  if (mode !== IntelligenceMode.HALLUCIN) {
    tools.push({ googleSearch: {} });
  }

  const systemInstruction = getSystemInstruction(mode, persona);

  let temperature = 0.7;
  if (mode === IntelligenceMode.SUMMARY) temperature = 0.3;
  if (mode === IntelligenceMode.DETAILED) temperature = 0.4;
  if (mode === IntelligenceMode.HALLUCIN) temperature = 1.2;
  if (persona === 'fun' || persona === 'pirate' || persona === 'shakespeare') temperature = 1.0;
  if (persona === 'robot' || persona === 'professional') temperature = 0.2;

  // *** CRITICAL UPDATE FOR QUOTAS ***
  // We are forcing the use of 'gemini-1.5-flash'.
  // This model has the highest free tier limits (15 RPM / 1,500 RPD).
  // The 'pro' and 'preview' models have near-zero limits on free tiers causing 429s.
  const primaryModel = 'gemini-1.5-flash';

  const generate = async (modelId: string) => {
    return await ai.models.generateContent({
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
  };

  try {
    const response = await generate(primaryModel);
    return processResponse(response);
  } catch (error: any) {
    console.warn(`Primary model ${primaryModel} failed.`, error);

    // If 1.5-flash fails, we are likely truly out of quota or offline.
    // We can try one last fallback to 'gemini-1.5-flash-8b' which is smaller/faster if available,
    // otherwise we re-throw the error.
    
    if (primaryModel === 'gemini-1.5-flash') {
       try {
         console.log("Attempting fallback to gemini-1.5-flash-8b...");
         const fallbackResponse = await generate('gemini-1.5-flash-8b');
         const result = processResponse(fallbackResponse);
         result.text += "\n\n_(Note: Response generated using high-efficiency 8B model due to network traffic.)_";
         return result;
       } catch (e) {
         // Both failed
         throw error;
       }
    }
    throw error;
  }
};

// Helper to extract text and sources
function processResponse(response: any): GenerationResult {
  const text = response.text || "No response generated.";
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
}

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Image generation often requires 2.0 or specific image models
      contents: { parts: [{ text: "Generate an image: " + prompt }] },
      // Note: Pure image generation via text-to-image API varies. 
      // If 2.0 flash returns text instead of image bytes, this specific call structure might need
      // adjustment based on the exact model capabilities enabled for the key.
      // For safety on free tier, we are using standard content generation.
    });
    
    // Check if the model returned inline data (image) or just text description
    // Most free tier text-models will just describe the image.
    // True image generation (Imagen) usually requires a paid project.
    // We attempt to find inline data if the model supports it.
    for (const part of response.candidates?.[0]?.content?.parts || []) {
       if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    
    // Fallback: If no image data, throw to UI
    throw new Error("Image generation is currently restricted on this API tier.");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts", // TTS usually specific to this model
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned.");
    return base64Audio;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    // TTS is very new/experimental, might hit quota often.
    throw new Error("Speech generation quota exceeded or unavailable.");
  }
};