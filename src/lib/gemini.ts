import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const geminiModel = "gemini-3-flash-preview";

export async function getAIResponse(prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `You are MindLock, an authoritative but motivating AI behavior control assistant. 
        Your goal is to enforce productivity and help users reach their long-term goals.
        Be strict when users fail, but provide actionable advice and personalized recommendations.
        Learn their habits and adjust their schedules.
        If they fail, suggest "Pain System" consequences (lock phone, penalty time, grayscale mode).
        If they succeed, celebrate and reward them with "Reward Time".
        Always be concise and impactful.`
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to my neural core. Please try again.";
  }
}

export async function verifyTask(taskTitle: string, taskDesc: string, proof: string, proofType: 'photo' | 'code' | 'answer') {
  const prompt = `Verify if this task is completed legitimately.
  Task: ${taskTitle}
  Description: ${taskDesc}
  Proof Type: ${proofType}
  Proof Content: ${proof}
  
  Return a JSON object:
  {
    "isLegit": boolean,
    "confidence": number (0-1),
    "feedback": "string explaining why or why not",
    "strictnessLevel": "high"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Verification Error:", error);
    return { isLegit: false, feedback: "Error during verification." };
  }
}
