
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
        // In browser/client-side, use import.meta.env (Vite environment variables)
        // Check for Vite env var first (browser), then fallback to process.env (server-side/Node)
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 
            (typeof window === 'undefined' && typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.GEMINI_API_KEY) ||
            (typeof window === 'undefined' && typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.API_KEY);
        if (!apiKey) {
            throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please set it in your Render environment variables.");
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
        Based on the following coaching session transcript, generate a comprehensive detailed report.
        This session involves two human participants, "Peer A" and "Peer B", moderated by an AI coach, "Kelly".
        The transcript labels each speaker explicitly (e.g., "Peer A:", "Peer B:", "Kelly:").
        Carefully analyze the conversation flow and distinguish between the two speakers based on the labeled transcript.

        IMPORTANT: Only count talk time and analyze content from what each peer ACTUALLY said (labeled "Peer A:" or "Peer B:"). Do NOT count Kelly's speech or assume 50/50 distribution.

        Transcript:
        ---
        ${transcript}
        ---

        The report must be in JSON format, adhering to the provided schema. Analyze the transcript for the following:

        1.  **Talk Time**: 
            - Calculate the ACTUAL percentage of talk time for Peer A vs. Peer B based ONLY on their labeled speech.
            - Provide details about what each peer talked about.
            - Total of peerA and peerB should be 100.

        2.  **Highlights**: Extract 2-4 key discussion points or insights for both Peer A and Peer B.

        3.  **Action Items & Commitments**: 
            - Identify all action items and commitments made by each peer.
            - Assign each action to either "Peer A" or "Peer B".
            - Mark completed: false for all (we don't know completion status yet).

        4.  **Sentiment Analysis**:
            - Analyze the overall sentiment and emotional tone of the session.
            - For EACH peer (Peer A and Peer B), identify:
              * Overall sentiment (positive/neutral/negative)
              * What went well (2-3 points)
              * What went wrong or needs improvement (1-2 points)
              * Emotional state description

        5.  **Risk Words Detection**:
            - Check if any inappropriate language, money requests, or sensitive information was mentioned.
            - If detected, list the words/categories and assess severity (low/medium/high).

        6.  **Homework Completion**:
            - Identify all commitments/action items that were made during the session.
            - Organize by peer (Peer A and Peer B).
            - For each commitment, mark completed: false (since this is a current session report).
            - Count total commitments vs. completed (all will be 0 completed for now).

        7.  **Engagement Score**:
            - Rate each peer's engagement level (0-100) based on participation, depth of responses, and interaction quality.
            - Provide an overall engagement score for the session.

        8.  **Mood Analysis**: Briefly describe the overall mood and synergy between the peers.

        9.  **Summary**: Provide a concise one-paragraph summary of the joint session.
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
                            peerADetails: { type: Type.STRING, description: "What Peer A talked about" },
                            peerBDetails: { type: Type.STRING, description: "What Peer B talked about" },
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
                                completed: { type: Type.STRING, description: "Always 'false' for current session" },
                            }
                        },
                    },
                    sentimentAnalysis: {
                        type: Type.OBJECT,
                        properties: {
                            overall: { type: Type.STRING, description: "Overall sentiment description" },
                            peerA: {
                                type: Type.OBJECT,
                                properties: {
                                    sentiment: { type: Type.STRING, description: "'positive', 'neutral', or 'negative'" },
                                    whatWentWell: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    whatWentWrong: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    emotionalState: { type: Type.STRING },
                                },
                            },
                            peerB: {
                                type: Type.OBJECT,
                                properties: {
                                    sentiment: { type: Type.STRING, description: "'positive', 'neutral', or 'negative'" },
                                    whatWentWell: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    whatWentWrong: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    emotionalState: { type: Type.STRING },
                                },
                            },
                        },
                    },
                    riskWords: {
                        type: Type.OBJECT,
                        properties: {
                            detected: { type: Type.STRING, description: "'true' or 'false' - whether risk words were found" },
                            words: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of detected risk words (only if detected is true)" },
                            categories: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Categories like 'inappropriate language', 'money request', 'PII' (only if detected is true)" },
                            severity: { type: Type.STRING, description: "'low', 'medium', or 'high' (only if detected is true)" },
                        },
                    },
                    homeworkCompletion: {
                        type: Type.OBJECT,
                        properties: {
                            peerA: {
                                type: Type.OBJECT,
                                properties: {
                                    totalCommitments: { type: Type.NUMBER },
                                    completed: { type: Type.NUMBER, description: "Always 0 for current session" },
                                    items: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                commitment: { type: Type.STRING },
                                                completed: { type: Type.STRING, description: "Always 'false' for current session" },
                                                notes: { type: Type.STRING },
                                            },
                                        },
                                    },
                                },
                            },
                            peerB: {
                                type: Type.OBJECT,
                                properties: {
                                    totalCommitments: { type: Type.NUMBER },
                                    completed: { type: Type.NUMBER, description: "Always 0 for current session" },
                                    items: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                commitment: { type: Type.STRING },
                                                completed: { type: Type.STRING, description: "Always 'false' for current session" },
                                                notes: { type: Type.STRING },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    engagementScore: {
                        type: Type.OBJECT,
                        properties: {
                            peerA: { type: Type.NUMBER, description: "0-100 engagement score" },
                            peerB: { type: Type.NUMBER, description: "0-100 engagement score" },
                            overall: { type: Type.NUMBER, description: "0-100 overall engagement" },
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
        const parsed = JSON.parse(jsonText);
        
        // Convert string booleans to actual booleans
        if (parsed.riskWords?.detected) {
            parsed.riskWords.detected = parsed.riskWords.detected === 'true' || parsed.riskWords.detected === true;
        }
        if (parsed.actionItems) {
            parsed.actionItems = parsed.actionItems.map((item: any) => ({
                ...item,
                completed: item.completed === 'true' || item.completed === true
            }));
        }
        if (parsed.homeworkCompletion) {
            if (parsed.homeworkCompletion.peerA?.items) {
                parsed.homeworkCompletion.peerA.items = parsed.homeworkCompletion.peerA.items.map((item: any) => ({
                    ...item,
                    completed: item.completed === 'true' || item.completed === true
                }));
            }
            if (parsed.homeworkCompletion.peerB?.items) {
                parsed.homeworkCompletion.peerB.items = parsed.homeworkCompletion.peerB.items.map((item: any) => ({
                    ...item,
                    completed: item.completed === 'true' || item.completed === true
                }));
            }
        }
        
        return parsed as SessionReport;
    } catch (e: any) {
        console.error("Failed to parse Gemini report response:", e);
        console.error("Response text:", response.text);
        throw new Error(`Could not generate session report: ${e.message || 'Invalid response format'}`);
    }
};