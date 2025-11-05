
import { Feature } from './types';

export const MODEL_FLASH = 'gemini-2.5-flash';
export const MODEL_FLASH_LITE = 'gemini-flash-lite-latest';
export const MODEL_PRO = 'gemini-2.5-pro';
export const MODEL_IMAGEN = 'imagen-4.0-generate-001';
export const MODEL_FLASH_IMAGE = 'gemini-2.5-flash-image';
export const MODEL_VIDEO = 'veo-3.1-fast-generate-preview';
export const MODEL_TTS = 'gemini-2.5-flash-preview-tts';
export const MODEL_LIVE = 'gemini-2.5-flash-native-audio-preview-09-2025';

export const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];
export const VIDEO_ASPECT_RATIOS = ["16:9", "9:16"];


export const FEATURES_CONFIG: { id: Feature; icon: string; description: string }[] = [
    { id: Feature.CHAT, icon: '💬', description: 'Ask questions and get answers from a helpful AI assistant.' },
    { id: Feature.THINKING_MODE, icon: '🧠', description: 'Tackle complex problems with advanced reasoning capabilities.' },
    { id: Feature.IMAGE_GENERATE, icon: '🖼️', description: 'Create stunning images from text descriptions.' },
    { id: Feature.IMAGE_EDIT, icon: '🎨', description: 'Edit existing images using simple text commands.' },
    { id: Feature.IMAGE_UNDERSTAND, icon: '👁️', description: 'Upload an image to have the AI analyze and describe it.' },
    { id: Feature.VIDEO_GENERATE, icon: '🎬', description: 'Generate short video clips from text or an initial image.' },
    { id: Feature.VIDEO_UNDERSTAND, icon: '🎥', description: 'Upload a video for AI analysis and key information extraction.' },
    { id: Feature.LIVE_CONVERSATION, icon: '🎙️', description: 'Have a real-time, spoken conversation with the AI.' },
    { id: Feature.AUDIO_TRANSCRIPTION, icon: '✍️', description: 'Record your voice and get an instant text transcription.' },
    { id: Feature.TTS, icon: '🔊', description: 'Convert text into natural-sounding speech.' },
    { id: Feature.GROUNDING_SEARCH, icon: '🌐', description: 'Get up-to-date answers from the web with citations.' },
    { id: Feature.GROUNDING_MAPS, icon: '🗺️', description: 'Find places and get location-based information.' },
    { id: Feature.ORCHESTRATION_SIM, icon: '🔗', description: 'Conceptual simulation of a multi-agent orchestration process.' },
];