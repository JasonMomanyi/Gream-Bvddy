import { AIPersona, IntelligenceMode, GroundingSource } from '../types';

// Declare the global puter object injected via script tag
declare var puter: any;

interface GenerationResult {
  text: string;
  sources: GroundingSource[];
}

const getPersonaInstruction = (persona: AIPersona): string => {
  // Reuse the persona logic, but simplify for non-Gemini models which accept plain text system prompts
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

  // Construct a pseudo-system prompt since Puter.js simple chat interface usually takes just a prompt or history
  const systemContext = `
    [SYSTEM INSTRUCTION]
    Mode: ${mode}
    Persona: ${getPersonaInstruction(persona)}
    Role: Gream Bvddy AI Assistant.
    Output: Markdown formatted.
  `;

  // Combine history for context
  // Puter allows passing an array of messages or just a string. 
  // For simplicity and compatibility across all their proxied models, we'll construct a prompt chain
  // or use their chat array format if supported by the specific model driver.
  // Most Puter examples use a simple string or an array. We'll try the array format.

  const fullHistory = [
    { role: 'system', content: systemContext },
    ...history,
    { role: 'user', content: prompt }
  ];

  try {
    // Puter.js V2 API call
    // puter.ai.chat(messages, options)
    const response = await puter.ai.chat(fullHistory, {
      model: modelId,
      stream: false // We'll do blocking for now to unify with current architecture, though streaming is possible
    });

    let text = "";
    
    // Handle various response formats from Puter's unified API
    if (response?.message?.content) {
      if (Array.isArray(response.message.content)) {
         // Claude style often returns array of content blocks
         text = response.message.content.map((c: any) => c.text || "").join("");
      } else {
         // String format
         text = response.message.content;
      }
    } else if (typeof response === 'string') {
      text = response;
    } else {
      text = JSON.stringify(response);
    }

    // Puter doesn't inherently return grounding sources (URLs) like Gemini Grounding
    // So we return empty sources, or we could parse the text for URLs if we wanted to be fancy.
    return {
      text: text,
      sources: [] 
    };

  } catch (error: any) {
    console.error("Puter API Error:", error);
    throw new Error(`External Model Error (${modelId}): ${error.message || 'Unknown error'}`);
  }
};