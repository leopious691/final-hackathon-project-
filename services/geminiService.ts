import { GoogleGenAI } from "@google/genai";
import { BloodGroup, RequestUrgency } from "../types";

const apiKey = process.env.API_KEY || ''; // In a real app, strict env handling
const ai = new GoogleGenAI({ apiKey });

export const generateEmergencyMessage = async (
  bloodGroup: BloodGroup,
  hospital: string,
  urgency: RequestUrgency,
  units: number
): Promise<string> => {
  if (!apiKey) return "API Key missing. Cannot generate message.";

  try {
    const prompt = `
      Act as a medical coordinator for a college blood donation app.
      Write a short, urgent, and compelling push notification message (max 140 chars) and a slightly longer description (max 300 chars) for a blood request.
      
      Details:
      - Blood Group: ${bloodGroup}
      - Hospital: ${hospital}
      - Urgency: ${urgency}
      - Units Needed: ${units}

      Return the response in JSON format with keys: "title" and "description".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return "Error generating message.";
    
    // Simple parsing, assuming valid JSON returned due to responseMimeType
    const json = JSON.parse(text);
    return json.description || json.title;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Urgent help needed! Please donate blood.";
  }
};

export const chatWithAssistant = async (userQuery: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  try {
    const prompt = `
      You are a helpful assistant for "Campus Blood Connect", a student blood donation app.
      Answer the user's question about blood donation eligibility, process, or health advice briefly and accurately.
      Keep the tone encouraging and informative.
      
      User Question: "${userQuery}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the knowledge base right now.";
  }
};