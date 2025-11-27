import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize Gemini API
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are "Charger," the AI assistant for Charge@Last, a premium mobile EV charging service.
Your tone is helpful, energetic, and professional.

Key Information:
- We bring power to the user (Residential, Commercial, Roadside).
- Service areas: Charleston, Raleigh-Durham, Atlanta.
- Services: Emergency roadside, home charging, fleet management.
- Pricing: ~$0.45/kWh + service fee ($25-$50).

Capabilities:
- Analyze images of charging ports or dashboards if provided.
- Provide location info using Google Maps if asked about places.
- Estimate costs and explain services.

Keep responses concise (under 100 words) unless asked for details. Use emojis ⚡🔋.
`;

/**
 * Converts a base64 string to the inlineData format expected by the SDK.
 */
const formatImagePart = (base64String: string) => {
  // Remove data URL prefix if present (e.g. "data:image/jpeg;base64,")
  const data = base64String.split(',')[1] || base64String;
  return {
    inlineData: {
      mimeType: 'image/jpeg', // Assuming jpeg for simplicity, could detect from header
      data: data
    }
  };
};

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  image?: string,
  userLocation?: { lat: number; lng: number }
): Promise<string> => {
  try {
    if (!apiKey) {
      return "I'm sorry, my API Key is missing. Please check configuration.";
    }

    // INTELLIGENT MODEL SELECTION
    // 1. If Image is present -> Use gemini-3-pro-preview (Vision)
    // 2. If Location/Maps query -> Use gemini-2.5-flash (Tools)
    // 3. Default Chat -> Use gemini-3-pro-preview (High Intelligence)
    
    let model = 'gemini-3-pro-preview';
    let tools: any[] = [];
    let toolConfig: any = undefined;

    // Check for location intent if no image is present
    const isLocationQuery = /where|near|location|map|find/i.test(newMessage);
    
    if (image) {
      model = 'gemini-3-pro-preview'; // Best for vision
    } else if (isLocationQuery) {
      model = 'gemini-2.5-flash'; // Flash supports Maps grounding well
      tools = [{ googleMaps: {} }];
      if (userLocation) {
        toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.lat,
              longitude: userLocation.lng
            }
          }
        };
      }
    }

    // Prepare Content
    const parts: any[] = [{ text: newMessage }];
    if (image) {
      parts.unshift(formatImagePart(image));
    }

    // We use generateContent (single turn with context) for easier switching between models/configs
    // Construct a prompt that includes history context manually if we aren't using a persistent chat session object
    // For this stateless service wrapper, we'll pass the history as context in the prompt or just use the new message for simplicity in this demo.
    // To do it properly with history:
    const contents = [
      ...history.map(h => ({
        role: h.role,
        parts: h.image ? [formatImagePart(h.image), { text: h.text }] : [{ text: h.text }]
      })),
      { role: 'user', parts: parts }
    ];

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: tools.length > 0 ? tools : undefined,
        toolConfig: toolConfig
      }
    });

    // Check for grounding metadata (Maps links)
    let responseText = response.text || "I didn't get a response.";
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      const links = groundingChunks
        .map((chunk: any) => {
          if (chunk.web?.uri) return `[${chunk.web.title}](${chunk.web.uri})`;
          if (chunk.maps?.placeId) return `[Open Map](https://www.google.com/maps/place/?q=place_id:${chunk.maps.placeId})`;
          return null;
        })
        .filter(Boolean)
        .join('\n');
      
      if (links) {
        responseText += `\n\nSources:\n${links}`;
      }
    }

    return responseText;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the grid right now. Please try again later.";
  }
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  try {
    if (!apiKey) return null;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // Decode Base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

/**
 * Summarizes a long message for safe driving consumption.
 */
export const summarizeMessage = async (text: string): Promise<string> => {
  try {
    if (!apiKey) return "Unable to summarize.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Summarize this text for a driver in under 15 words. Be direct. Text: "${text}"`,
    });
    return response.text || "No summary available.";
  } catch (error) {
    console.error("Summarization Error:", error);
    return "Summarization unavailable.";
  }
};

/**
 * Generates 3 smart replies for a given message context.
 */
export const generateSmartReplies = async (text: string): Promise<string[]> => {
  try {
    if (!apiKey) return ["Yes", "No", "Call me"];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 3 short, driver-friendly replies (max 4 words each) for this message: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const json = JSON.parse(response.text || '{"replies": []}');
    return json.replies || ["OK", "On my way", "Talk later"];
  } catch (error) {
    console.error("Smart Reply Error:", error);
    return ["OK", "Can't talk", "Call me"];
  }
};