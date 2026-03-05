
import { GoogleGenAI, Type } from "@google/genai";
import { ItineraryResponse, TravelFormData } from "../types";

const SYSTEM_INSTRUCTION = `You are the "Northern Path AI," an expert Canadian Travel Architect. Your goal is to generate hyper-specific, logistically sound itineraries across Canada.
- ONLY suggest Canadian locations.
- Ensure travel times between activities are realistic for Canadian geography.
- If the user mentions a budget, prioritize activities accordingly.
- Use current season or general availability.
- Output MUST be strictly valid JSON following the provided schema.`;

const ITINERARY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    trip_title: { type: Type.STRING },
    total_days: { type: Type.NUMBER },
    currency: { type: Type.STRING },
    itinerary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          theme: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                time: { type: Type.STRING },
                title: { type: Type.STRING },
                location: { type: Type.STRING },
                description: { type: Type.STRING },
                cost_estimate: { type: Type.NUMBER },
                category: { type: Type.STRING }
              },
              required: ["id", "time", "title", "location", "description", "cost_estimate", "category"]
            }
          }
        },
        required: ["day", "theme", "activities"]
      }
    },
    sidebar_suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          reason: { type: Type.STRING }
        }
      }
    }
  },
  required: ["trip_title", "total_days", "currency", "itinerary", "sidebar_suggestions"]
};

export async function generateItinerary(data: TravelFormData): Promise<ItineraryResponse> {
  // Use import.meta.env for Vite projects
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'PLACEHOLDER_API_KEY';
  const ai = new GoogleGenAI(apiKey);

  const prompt = `Generate a ${data.days}-day ${data.budget} trip to ${data.destination} in Canada. 
  The interests are: ${data.interests}. Provide a detailed hour-by-hour itinerary for each day.`;

  try {
    const response = await ai.models.generateContent({
      // Fixed: Switched to 'gemini-3-pro-preview' for advanced reasoning and itinerary planning
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: ITINERARY_SCHEMA,
      },
    });

    // Accessing the .text property directly (not a method) as required by the SDK
    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as ItineraryResponse;
  } catch (error) {
    console.error("Failed to generate itinerary:", error);
    throw error;
  }
}
