
export enum Feature {
  CHAT = 'Chat',
  IMAGE_GENERATE = 'Image Generation',
  IMAGE_EDIT = 'Image Editing',
  IMAGE_UNDERSTAND = 'Image Understanding',
  VIDEO_GENERATE = 'Video Generation',
  // VIDEO_UNDERSTAND = 'Video Understanding', // Complex, so simplified
  AUDIO_TRANSCRIPTION = 'Audio Transcription',
  TTS = 'Text-to-Speech',
  LIVE_CONVERSATION = 'Live Conversation',
  GROUNDING_SEARCH = 'Web Search',
  GROUNDING_MAPS = 'Map Search',
  THINKING_MODE = 'Complex Reasoning',
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets: {
            uri: string;
            reviewText: string;
            author: string;
        }[];
    }
  };
}
