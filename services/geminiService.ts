import { GoogleGenAI } from "@google/genai";
import { CartItem, Promotion } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateUpsellSuggestions = async (
  cart: CartItem[], 
  promotions: Promotion[]
): Promise<string> => {
  if (!apiKey) return "API Key not configured.";

  const activePromos = promotions.filter(p => p.isActive).map(p => p.title).join(", ");
  const cartDescription = cart.map(i => `${i.quantity}x ${i.name}`).join(", ");

  const prompt = `
    You are a helpful Point of Sale Assistant.
    Current Cart: ${cartDescription || "Empty"}
    Active Promotions: ${activePromos || "None"}

    Based on the current cart, suggest 2 specific items to upsell to the customer. 
    Keep it brief (max 2 sentences). 
    If the cart is empty, suggest a popular starter item.
    Mention an active promotion if relevant.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No suggestions available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate suggestions at this time.";
  }
};

export const analyzeShiftData = async (
  logs: string[]
): Promise<string> => {
    if (!apiKey) return "API Key not configured.";

    const prompt = `
      Analyze these audit logs from a POS session and provide a brief 1-sentence summary of the activity level and any anomalies.
      Logs:
      ${logs.slice(-10).join("\n")}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Analysis failed.";
    } catch (error) {
        return "Service unavailable.";
    }
}
