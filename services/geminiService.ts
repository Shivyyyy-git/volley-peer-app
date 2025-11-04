
// Dynamic import to ensure browser uses importmap
let genaiModule: any = null;

const getGenAIModule = async () => {
    if (!genaiModule) {
        // Dynamic import ensures browser uses importmap from index.html
        genaiModule = await import("@google/genai");
    }
    return genaiModule;
};

import { SessionReport } from '../types';

// Lazy initialization to avoid throwing error at module load time
let ai: any = null;

const getAI = async () => {
    if (!ai) {
        const module = await getGenAIModule();
        const { GoogleGenAI } = module;
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("API_KEY or GEMINI_API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};

export const connectToLiveSession = async (callbacks: {
    onOpen: () => void;
    onMessage: (message: any) => void;
    onError: (error: ErrorEvent) => void;
    onClose: (event: CloseEvent) => void;
}): Promise<any> => {
    const module = await getGenAIModule();
    const { Modality } = module;
    const aiInstance = await getAI();
    return aiInstance.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: callbacks.onOpen,
            onmessage: callbacks.onMessage,
            onerror: callbacks.onError,
            onclose: callbacks.onClose,
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: 'You are Kelly, a helpful and insightful peer coach. Your goal is to listen, ask clarifying questions, and help the user achieve their goals. Keep your responses concise and encouraging.',
        },
    });
};

export const generateSessionReport = async (transcript: string): Promise<SessionReport> => {
    const module = await getGenAIModule();
    const aiInstance = await getAI();
    const { Type } = module;
    
    const prompt = `
        Based on the following coaching session transcript, generate a detailed report.
        This session involves two human participants, "Peer A" and "Peer B", moderated by an AI coach, "Kelly".
        The user's speech in the transcript (labeled "You:") contains the combined dialogue of BOTH Peer A and Peer B, who are taking turns speaking.
        Analyze the conversation flow to distinguish between the two speakers based on the prompts and context.

        Transcript:
        ---
        ${transcript}
        ---

        The report must be in JSON format, adhering to the provided schema. Analyze the transcript for the following:
        1.  **Talk Time**: Estimate the percentage of talk time for Peer A vs. Peer B. The total of peerA and peerB should be 100.
        2.  **Highlights**: Extract 2-3 key discussion points or insights for both Peer A and Peer B.
        3.  **Action Items**: Identify any clear action items or commitments made. Assign each action to either "Peer A" or "Peer B".
        4.  **Mood Analysis**: Briefly describe the overall mood and synergy between the peers (e.g., "Collaborative and energetic", "Supportive but one-sided").
        5.  **Summary**: Provide a concise one-paragraph summary of the joint session.
    `;

    const response = await aiInstance.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    talkTime: {
                        type: Type.OBJECT,
                        properties: {
                            peerA: { type: Type.NUMBER, description: "Peer A's talk time percentage (0-100)" },
                            peerB: { type: Type.NUMBER, description: "Peer B's talk time percentage (0-100)" },
                        },
                    },
                    highlights: {
                        type: Type.OBJECT,
                        properties: {
                            peerA: { type: Type.ARRAY, items: { type: Type.STRING } },
                            peerB: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                    },
                    actionItems: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                action: { type: Type.STRING },
                                owner: { type: Type.STRING, description: "'Peer A' or 'Peer B'" },
                            }
                        },
                    },
                    moodAnalysis: { type: Type.STRING },
                    summary: { type: Type.STRING },
                },
            },
        },
    });
    
    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SessionReport;
    } catch (e) {
        console.error("Failed to parse Gemini report response:", e, "Original text:", response.text);
        throw new Error("Could not generate session report due to invalid format.");
    }
};