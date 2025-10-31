
import React from 'react';
import { Feature } from '../types';
import ChatPanel from './feature-panels/ChatPanel';
import ImageGeneratePanel from './feature-panels/ImageGeneratePanel';
import ImageEditPanel from './feature-panels/ImageEditPanel';
import ImageUnderstandPanel from './feature-panels/ImageUnderstandPanel';
import VideoGeneratePanel from './feature-panels/VideoGeneratePanel';
import AudioTranscriptionPanel from './feature-panels/AudioTranscriptionPanel';
import TextToSpeechPanel from './feature-panels/TextToSpeechPanel';
import LiveConversationPanel from './feature-panels/LiveConversationPanel';
import GroundingSearchPanel from './feature-panels/GroundingSearchPanel';
import GroundingMapsPanel from './feature-panels/GroundingMapsPanel';
import ThinkingModePanel from './feature-panels/ThinkingModePanel';


interface MainContentProps {
    activeFeature: Feature;
    setStatusMessage: (message: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({ activeFeature, setStatusMessage }) => {
    switch (activeFeature) {
        case Feature.CHAT:
            return <ChatPanel setStatusMessage={setStatusMessage} />;
        case Feature.THINKING_MODE:
            return <ThinkingModePanel setStatusMessage={setStatusMessage} />;
        case Feature.IMAGE_GENERATE:
            return <ImageGeneratePanel setStatusMessage={setStatusMessage} />;
        case Feature.IMAGE_EDIT:
            return <ImageEditPanel setStatusMessage={setStatusMessage} />;
        case Feature.IMAGE_UNDERSTAND:
            return <ImageUnderstandPanel setStatusMessage={setStatusMessage} />;
        case Feature.VIDEO_GENERATE:
             return <VideoGeneratePanel setStatusMessage={setStatusMessage} />;
        case Feature.AUDIO_TRANSCRIPTION:
             return <AudioTranscriptionPanel setStatusMessage={setStatusMessage} />;
        case Feature.TTS:
             return <TextToSpeechPanel setStatusMessage={setStatusMessage} />;
        case Feature.LIVE_CONVERSATION:
             return <LiveConversationPanel setStatusMessage={setStatusMessage} />;
        case Feature.GROUNDING_SEARCH:
             return <GroundingSearchPanel setStatusMessage={setStatusMessage} />;
        case Feature.GROUNDING_MAPS:
             return <GroundingMapsPanel setStatusMessage={setStatusMessage} />;
        default:
            return <div className="p-4">Select a feature from the left panel.</div>;
    }
};

export default MainContent;
