
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { VoiceNote, Report } from "../types";

// Initialize AI with the provided API key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * Professional processing of the final audio using Gemini 3 Pro for high-quality rewriting.
 */
export const processVoiceAudio = async (base64Audio: string, userId: string): Promise<Partial<VoiceNote>> => {
  const ai = getAI();
  const model = 'gemini-3-pro-preview'; // Higher quality for the final professional output
  
  const audioPart = {
    inlineData: {
      mimeType: 'audio/webm',
      data: base64Audio,
    },
  };

  const promptPart = {
    text: `You are an elite Myanmar executive assistant. 
    Task:
    1. Transcribe the audio precisely into Myanmar Unicode (Pyidaungsu font compatible).
    2. Rewrite the transcript into a professional, formal, and concise version suitable for business reports. Remove fillers and stuttering.
    3. Provide a 1-sentence summary in Myanmar.
    4. Extract 5 relevant keywords.
    5. Categorize the note (Work, Personal, Education, Idea, General).
    6. Generate a short, punchy title in Myanmar.
    
    Return strictly in JSON format.`,
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [audioPart, promptPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalText: { type: Type.STRING },
            refinedText: { type: Type.STRING },
            summary: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            category: { type: Type.STRING },
            title: { type: Type.STRING }
          },
          required: ["originalText", "refinedText", "summary", "keywords", "category", "title"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      ...result,
      userId,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    };
  } catch (error) {
    console.error("Gemini Final Processing Error:", error);
    throw error;
  }
};

/**
 * Connect to Gemini Live API for real-time transcription feedback.
 */
export const connectLiveTranscription = (callbacks: {
  onTranscription: (text: string) => void;
  onError: (err: any) => void;
}) => {
  const ai = getAI();
  let fullTranscript = "";

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: () => console.log("Live session opened"),
      onmessage: async (message: LiveServerMessage) => {
        if (message.serverContent?.inputAudioTranscription) {
          const text = message.serverContent.inputAudioTranscription.text;
          fullTranscript += text;
          callbacks.onTranscription(fullTranscript);
        }
        if (message.serverContent?.turnComplete) {
          // Can handle turn completion if needed
        }
      },
      onerror: (e) => callbacks.onError(e),
      onclose: () => console.log("Live session closed"),
    },
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      systemInstruction: "You are a transcription engine. Just transcribe what you hear in Myanmar language accurately."
    },
  });

  return sessionPromise;
};

export const generateAIReport = async (notes: VoiceNote[], period: 'daily' | 'weekly' | 'monthly'): Promise<Partial<Report>> => {
  const ai = getAI();
  const model = 'gemini-3-pro-preview';
  
  const notesContext = notes.map(n => `Title: ${n.title}\nContent: ${n.refinedText}\nSummary: ${n.summary}`).join("\n---\n");
  
  const prompt = `Analyze these ${notes.length} Myanmar voice notes from a ${period} period.
  Create a professional summary report in Myanmar language including:
  - Top Topics (as a list)
  - Key Insights (behavioral patterns, productivity, progress)
  - Strategic Recommendations for the user.
  
  Notes:
  ${notesContext}
  
  Return strictly in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
            insights: { type: Type.STRING },
            recommendations: { type: Type.STRING }
          },
          required: ["topTopics", "insights", "recommendations"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      ...result,
      period,
      noteCount: notes.length,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    };
  } catch (error) {
    console.error("Report Generation Error:", error);
    throw error;
  }
};
