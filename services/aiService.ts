import Groq from "groq-sdk";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize APIs
const geminiApiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
const groqApiKey = process.env.GROQ_API_KEY || '';

// Determine which service to use
const useGroq = groqApiKey && groqApiKey !== '';
const useGemini = geminiApiKey && geminiApiKey !== '' && geminiApiKey !== 'demo_mode_placeholder';

let groqClient: Groq | null = null;
let geminiClient: GoogleGenAI | null = null;

if (useGroq) {
  groqClient = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
  console.log('✅ Using Groq API for AI features');
} else if (useGemini) {
  geminiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  console.log('✅ Using Gemini API for AI features');
} else {
  console.log('⚠️ Running in demo mode - AI features limited');
}

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
 * Send message using available AI service (Groq or Gemini)
 */
export const sendMessageToAI = async (
  history: ChatMessage[],
  newMessage: string,
  image?: string,
  userLocation?: { lat: number; lng: number }
): Promise<string> => {
  try {
    // Use Groq if available (faster for text)
    if (useGroq && groqClient && !image) {
      const messages = [
        { role: 'system' as const, content: SYSTEM_INSTRUCTION },
        ...history.map(h => ({
          role: h.role === 'user' ? 'user' as const : 'assistant' as const,
          content: h.text
        })),
        { role: 'user' as const, content: newMessage }
      ];

      const completion = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile", // Fast and capable
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || "I didn't get a response.";
    }

    // Use Gemini if available (better for vision and maps)
    if (useGemini && geminiClient) {
      return await sendMessageToGemini(history, newMessage, image, userLocation, geminiClient);
    }

    // Demo mode fallback
    return getDemoResponse(newMessage);

  } catch (error) {
    console.error("AI Service Error:", error);
    return "Sorry, I'm having trouble connecting right now. Please try again later. ⚡";
  }
};

/**
 * Gemini-specific implementation (for vision and maps)
 */
const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  image?: string,
  userLocation?: { lat: number; lng: number },
  ai: GoogleGenAI
): Promise<string> => {
  const formatImagePart = (base64String: string) => {
    const data = base64String.split(',')[1] || base64String;
    return {
      inlineData: {
        mimeType: 'image/jpeg',
        data: data
      }
    };
  };

  let model = 'gemini-2.0-flash-exp';
  let tools: any[] = [];
  let toolConfig: any = undefined;

  const isLocationQuery = /where|near|location|map|find/i.test(newMessage);
  
  if (isLocationQuery) {
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

  const parts: any[] = [{ text: newMessage }];
  if (image) {
    parts.unshift(formatImagePart(image));
  }

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
};

/**
 * Demo mode responses
 */
const getDemoResponse = (message: string): string => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
    return "⚡ Our pricing is simple: $0.45/kWh plus a service fee ($25 for residential, $50 for roadside). For example, a 40kWh charge at home costs about $43 total! 🔋";
  }
  
  if (lowerMsg.includes('area') || lowerMsg.includes('location') || lowerMsg.includes('where')) {
    return "📍 We currently serve Charleston, Raleigh-Durham, and Atlanta! We bring mobile EV charging directly to your location - home, work, or roadside. ⚡";
  }
  
  if (lowerMsg.includes('how') || lowerMsg.includes('work')) {
    return "🚗 Just request a charge through our app, select your service type, and we'll dispatch a mobile charging truck to your location! Track your technician in real-time. It's that easy! ⚡";
  }
  
  if (lowerMsg.includes('time') || lowerMsg.includes('long') || lowerMsg.includes('eta')) {
    return "⏱️ Typical response time is 15-30 minutes depending on your location and technician availability. You can track your technician's ETA in real-time! 🔋";
  }
  
  return "⚡ Thanks for reaching out! I'm here to help with Charge@Last services. We offer residential, roadside, and fleet EV charging across Charleston, Raleigh-Durham, and Atlanta. How can I assist you today? 🔋";
};

/**
 * Generate speech (Gemini only for now)
 */
export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  try {
    if (!useGemini || !geminiClient) return null;

    const response = await geminiClient.models.generateContent({
      model: "gemini-2.0-flash-exp",
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
 * Summarize message for driving
 */
export const summarizeMessage = async (text: string): Promise<string> => {
  try {
    if (useGroq && groqClient) {
      const completion = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: 'system', content: 'Summarize in under 15 words for a driver. Be direct.' },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 50,
      });
      return completion.choices[0]?.message?.content || "Message received.";
    }

    if (useGemini && geminiClient) {
      const response = await geminiClient.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: `Summarize this text for a driver in under 15 words. Be direct. Text: "${text}"`,
      });
      return response.text || "Message received.";
    }

    return text.slice(0, 50) + (text.length > 50 ? '...' : '');
  } catch (error) {
    console.error("Summarization Error:", error);
    return "Message received.";
  }
};

/**
 * Generate smart replies
 */
export const generateSmartReplies = async (text: string): Promise<string[]> => {
  try {
    if (useGroq && groqClient) {
      const completion = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: 'system', content: 'Generate 3 short driver-friendly replies (max 4 words each). Return as JSON array: ["reply1", "reply2", "reply3"]' },
          { role: 'user', content: text }
        ],
        temperature: 0.5,
        max_tokens: 50,
      });
      
      const content = completion.choices[0]?.message?.content || '["OK", "On my way", "Talk later"]';
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed.slice(0, 3) : ["OK", "On my way", "Talk later"];
      } catch {
        return ["OK", "On my way", "Talk later"];
      }
    }

    if (useGemini && geminiClient) {
      const response = await geminiClient.models.generateContent({
        model: "gemini-2.0-flash-exp",
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
    }

    return ["Yes", "No", "Call me"];
  } catch (error) {
    console.error("Smart Reply Error:", error);
    return ["OK", "Can't talk", "Call me"];
  }
};

// Backwards compatibility export
export const sendMessageToGemini = sendMessageToAI;
