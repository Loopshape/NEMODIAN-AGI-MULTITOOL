import { GoogleGenAI, GenerateContentResponse, Chat, GroundingChunk, GenerateContentCandidate, Modality } from "@google/genai";
import { ChatMessage } from '../types';

let ai: GoogleGenAI;
const getAi = () => {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    }
    return ai;
};

// For Veo models, we need to re-initialize to pick up the user-selected key
const getVeoAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });


export const generateText = async (model: string, prompt: string, useThinking: boolean = false): Promise<string> => {
    try {
        const aiInstance = getAi();
        const config: any = {};
        if (useThinking) {
            config.thinkingConfig = { thinkingBudget: 32768 };
        }
        
        const response: GenerateContentResponse = await aiInstance.models.generateContent({
            model: model,
            contents: prompt,
            config: Object.keys(config).length > 0 ? config : undefined,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating text:", error);
        return "Sorry, I encountered an error while processing your request.";
    }
};

export const createChatSession = (model: string): Chat => {
    const aiInstance = getAi();
    return aiInstance.chats.create({ model });
};

export const streamChatMessage = (chat: Chat, message: string): Promise<AsyncGenerator<GenerateContentResponse>> => {
    return chat.sendMessageStream({ message });
};


export const generateImage = async (prompt: string, aspectRatio: string): Promise<string | null> => {
    try {
        const aiInstance = getAi();
        const response = await aiInstance.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
            },
        });
        const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
        return base64ImageBytes ? `data:image/jpeg;base64,${base64ImageBytes}` : null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string | null> => {
    try {
        const aiInstance = getAi();
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: imageBase64, mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error editing image:", error);
        return null;
    }
};

export const understandImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const aiInstance = getAi();
        const response: GenerateContentResponse = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ inlineData: { data: imageBase64, mimeType } }, { text: prompt }] },
        });
        return response.text;
    } catch (error) {
        console.error("Error understanding image:", error);
        return "Failed to analyze the image.";
    }
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16', image?: { base64: string, mimeType: string }) => {
    try {
        const aiInstance = getVeoAi(); // Use fresh instance for Veo
        const payload: any = {
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        };
        if (image) {
            payload.image = {
                imageBytes: image.base64,
                mimeType: image.mimeType
            };
        }
        
        let operation = await aiInstance.models.generateVideos(payload);
        return operation;
    } catch (error) {
        console.error("Error starting video generation:", error);
        throw error;
    }
};

export const checkVideoOperation = async (operation: any) => {
    try {
        const aiInstance = getVeoAi();
        return await aiInstance.operations.getVideosOperation({ operation });
    } catch (error) {
        console.error("Error checking video operation status:", error);
        throw error;
    }
};


export const transcribeAudio = async (audioBase64: string): Promise<string> => {
    try {
        const aiInstance = getAi();
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [{
                    inlineData: {
                        mimeType: 'audio/webm',
                        data: audioBase64,
                    }
                }, {
                    text: "Transcribe this audio."
                }]
            }
        });
        return response.text;
    } catch(error) {
        console.error('Error transcribing audio:', error);
        return "Transcription failed.";
    }
};


export const generateSpeech = async (text: string): Promise<string | null> => {
    const aiInstance = getAi();
    try {
        const response = await aiInstance.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say: ${text}` }] }],
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
        return base64Audio || null;
    } catch(error) {
        console.error("Error generating speech:", error);
        return null;
    }
};

export const groundWithSearch = async (prompt: string): Promise<{ text: string, chunks: GroundingChunk[] }> => {
    const aiInstance = getAi();
    try {
        const response = await aiInstance.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { text: response.text, chunks };
    } catch (error) {
        console.error("Error with Search Grounding:", error);
        return { text: "An error occurred during the search.", chunks: [] };
    }
};


export const groundWithMaps = async (prompt: string, coords: GeolocationCoordinates): Promise<{ text: string, chunks: GroundingChunk[] }> => {
    const aiInstance = getAi();
    try {
        const response = await aiInstance.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: coords.latitude,
                            longitude: coords.longitude
                        }
                    }
                }
            },
        });
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { text: response.text, chunks };
    } catch (error) {
        console.error("Error with Maps Grounding:", error);
        return { text: "An error occurred during the map search.", chunks: [] };
    }
};