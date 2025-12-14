import { AIPersona, IntelligenceMode, GroundingSource } from '../types';

// Declare the global puter object injected via script tag
declare var puter: any;

interface GenerationResult {
  text: string;
  sources: GroundingSource[];
}

const getPersonaInstruction = (persona: AIPersona): string => {
  switch (persona) {
    case 'professional': return "Adopt a Professional, Executive tone. Focus on ROI and efficiency.";
    case 'hacker': return "Adopt a Hacker/Cyberpunk persona. Use technical jargon and be security-focused.";
    case 'kid': return "Explain like I'm 5 years old. Be enthusiastic and simple.";
    case 'pirate': return "Speak like a Pirate Captain. Arrr!";
    case 'fun': return "Be witty, sarcastic, and entertaining.";
    default: return "Be helpful, precise, and professional.";
  }
};

export const generatePuterResponse = async (
  prompt: string,
  modelId: string,
  mode: IntelligenceMode,
  history: { role: string; content: string }[],
  persona: AIPersona
): Promise<GenerationResult> => {
  
  if (typeof puter === 'undefined') {
    throw new Error("Puter.js not loaded. Check internet connection.");
  }

  const systemContext = `
    [SYSTEM INSTRUCTION]
    Mode: ${mode}
    Persona: ${getPersonaInstruction(persona)}
    Role: Gream Bvddy AI Assistant.
    Output: Markdown formatted.
  `;

  const fullHistory = [
    { role: 'system', content: systemContext },
    ...history,
    { role: 'user', content: prompt }
  ];

  try {
    // Puter.js call with strict timeout to prevent infinite "Connecting..." state
    const timeoutMs = 30000; // 30 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Connection to ${modelId} timed out after 30s.`)), timeoutMs);
    });

    const chatPromise = puter.ai.chat(fullHistory, {
      model: modelId,
      stream: false
    });

    // Race the API call against the timeout
    const response: any = await Promise.race([chatPromise, timeoutPromise]);

    let text = "";
    
    if (response?.message?.content) {
      if (Array.isArray(response.message.content)) {
         text = response.message.content.map((c: any) => c.text || "").join("");
      } else {
         text = response.message.content;
      }
    } else if (typeof response === 'string') {
      text = response;
    } else {
      text = JSON.stringify(response);
    }

    return {
      text: text,
      sources: [] 
    };

  } catch (error: any) {
    console.error("Puter API Error:", error);
    // Return a clearer error message
    throw new Error(`External Model Error: ${error.message || 'Unknown error'}`);
  }
};
