
import React, { useState, useEffect, useRef } from 'react';
import { generateVideo, checkVideoOperation } from '../../services/geminiService';
import Button from '../common/Button';
import ApiKeyModal from '../common/ApiKeyModal';
import { VIDEO_ASPECT_RATIOS } from '../../constants';

interface VideoGeneratePanelProps {
    setStatusMessage: (message: string) => void;
}

const POLLING_INTERVAL = 10000; // 10 seconds

const VideoGeneratePanel: React.FC<VideoGeneratePanelProps> = ({ setStatusMessage }) => {
    const [prompt, setPrompt] = useState('A neon hologram of a cat driving a sports car at top speed.');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    
    const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
    const [apiKeySelected, setApiKeySelected] = useState(false);
    
    const operationRef = useRef<any>(null);
    const pollingTimer = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setApiKeySelected(true);
            }
        };
        checkApiKey();
        
        return () => {
            if (pollingTimer.current) {
                clearInterval(pollingTimer.current);
            }
        };
    }, []);

    const pollOperation = async () => {
        if (!operationRef.current) return;
        
        try {
            const updatedOperation = await checkVideoOperation(operationRef.current);
            operationRef.current = updatedOperation;
            
            if (updatedOperation.done) {
                if (pollingTimer.current) clearInterval(pollingTimer.current);
                const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                if (downloadLink) {
                    const videoRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                    const blob = await videoRes.blob();
                    setVideoUrl(URL.createObjectURL(blob));
                    setStatusMessage('Video generation complete!');
                    setLoadingMessage('');
                } else {
                    setStatusMessage('Video generation finished but no video found.');
                    setLoadingMessage('Finished, but there was an error.');
                }
                setIsLoading(false);
            } else {
                 setLoadingMessage('Still processing... Your video is being crafted frame by frame.');
            }
        } catch (error: any) {
            console.error(error);
            if (pollingTimer.current) clearInterval(pollingTimer.current);
            setStatusMessage('Error checking video status.');
            setLoadingMessage('An error occurred during generation.');
            setIsLoading(false);
        }
    };
    
    const handleGenerate = async () => {
        if (!prompt.trim() && !imageFile) return;

        if (!apiKeySelected) {
            setIsKeyModalOpen(true);
            return;
        }

        setIsLoading(true);
        setVideoUrl(null);
        setStatusMessage('Starting video generation...');
        setLoadingMessage('Initializing generation... This may take a few minutes.');

        try {
            const imagePayload = imageFile && imageBase64 ? { base64: imageBase64, mimeType: imageFile.type } : undefined;
            const op = await generateVideo(prompt, aspectRatio, imagePayload);
            operationRef.current = op;
            pollingTimer.current = window.setInterval(pollOperation, POLLING_INTERVAL);
        } catch (error: any) {
             if(error?.message?.includes('Requested entity was not found')) {
                setApiKeySelected(false);
                setIsKeyModalOpen(true);
                setStatusMessage('API Key invalid. Please select a new one.');
            } else {
                setStatusMessage('Failed to start video generation.');
            }
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleKeySelect = async () => {
        await window.aistudio.openSelectKey();
        setApiKeySelected(true); // Assume success to avoid race condition
        setIsKeyModalOpen(false);
        setStatusMessage('API Key selected. You can now generate a video.');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setImageBase64(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full">
            {isKeyModalOpen && <ApiKeyModal onSelectKey={handleKeySelect} onClose={() => setIsKeyModalOpen(false)} />}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold">Prompt (optional if using an image)</label>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className="w-full p-2 rounded bg-[#22241e] border border-[#4a4c41] resize-none"/>
            </div>
             <div className="flex items-center gap-4 flex-wrap">
                <label className="text-sm font-bold">Aspect Ratio</label>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')} className="p-2 rounded bg-[#22241e] border border-[#4a4c41]">
                    {VIDEO_ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} className="bg-[#5bc0de] border-[#5bc0de]">Upload Start Image</Button>
                <Button onClick={handleGenerate} isLoading={isLoading}>Generate Video</Button>
            </div>
            {imageFile && <p className="text-xs text-[#999966]">Using image: {imageFile.name}</p>}

            <div className="flex-1 mt-4 bg-[#22241e] rounded-lg flex items-center justify-center overflow-hidden">
                {isLoading && <div className="text-center"><p>{loadingMessage}</p><p className="text-xs text-gray-400 mt-2">(Please keep this tab open)</p></div>}
                {videoUrl && <video src={videoUrl} controls autoPlay loop className="max-h-full max-w-full" />}
                {!isLoading && !videoUrl && <div className="text-[#999966]">Your generated video will appear here</div>}
            </div>
        </div>
    );
};

export default VideoGeneratePanel;
