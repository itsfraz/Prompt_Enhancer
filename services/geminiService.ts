
import { GoogleGenAI, Type } from "@google/genai";
import { StyleDefinition, EnhancementResult } from "../types";

export const enhancePrompt = async (
  input: string, 
  style: StyleDefinition,
  intensity: number = 3
): Promise<EnhancementResult> => {
  try {
    // Initialize GoogleGenAI right before the call to ensure the most up-to-date API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const intensityMap: Record<number, string> = {
      1: "Subtle & Conservative: Minimal changes, focused on basic grammar and slight clarity improvements.",
      2: "Modest: Light enhancements to vocabulary and flow without changing the core structure.",
      3: "Balanced: Standard professional enhancement with good descriptive depth and structural optimization.",
      4: "High: Significant creative flourishes, advanced vocabulary, and strong atmospheric/technical expansion.",
      5: "Maximum / Extreme: Full transformation. Highly evocative, incredibly detailed, and deeply immersive or technically dense."
    };

    // Switched to gemini-3-pro-preview as prompt engineering and narrative enhancement are complex text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Enhance the following text using the style/instruction provided.
      
      Target Style Name: ${style.name}
      Style Specific Instructions: ${style.instruction}
      
      Enhancement Intensity Level: ${intensity}/5
      Intensity Instruction: ${intensityMap[intensity]}
      
      Original text to enhance: "${input}"
      
      General rules for the response:
      - Adhere strictly to the requested intensity level.
      - Improve clarity, vocabulary, and structural impact based on the target style.
      - For AI prompts, optimize for maximum model adherence and clear constraints.
      - For stories, make them immersive, evocative, and well-paced.
      - Maintain the original intent but maximize quality.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            enhanced: { type: Type.STRING },
            explanation: { type: Type.STRING, description: "Detailed explanation of what was improved." },
            keyChanges: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Short bullet points of specific linguistic or structural changes."
            },
            tips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "General tips for the user to improve their writing in the future."
            }
          },
          required: ["original", "enhanced", "explanation", "keyChanges", "tips"]
        }
      }
    });

    // response.text is a getter, not a method.
    const result = JSON.parse(response.text);
    return result as EnhancementResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to enhance prompt. Please try again.");
  }
};
