
import React, { useState, useRef } from 'react';
import { understandVideo } from '../../services/geminiService';
import Button from '../common/Button';

interface VideoUnderstandPanelProps {
    setStatusMessage: (message: string) => void;
}

const VideoUnderstandPanel: React.FC<VideoUnderstandPanelProps> = ({ setStatusMessage }) => {
    const [prompt, setPrompt] = useState('What are the key events or objects in this video?');
    const [video, setVideo] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setVideo(reader.result as string);
                setResponse('');
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAnalyze = async () => {
        if (!prompt.trim() || !videoFile || !video) return;
        setIsLoading(true);
        setResponse('');
        setStatusMessage('Analyzing video...');
        const base64 = video.split(',')[1];
        const result = await understandVideo(prompt, base64, videoFile.type);
        setResponse(result);
        setStatusMessage(result ? 'Video analysis complete.' : 'Video analysis failed.');
        setIsLoading(false);
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full">
            <h2 className="text-lg font-bold">Video Understanding</h2>
            <p className="text-sm text-[#999966]">Upload a video and ask the AI to analyze its content.</p>
            <input type="file" accept="video/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                <div className="bg-[#22241e] rounded-lg flex flex-col items-center justify-center p-2 overflow-hidden">
                    {video ? <video src={video} controls className="max-h-full max-w-full object-contain" /> : <p className="text-[#999966]">Upload a video to analyze</p>}
                </div>
                 <div className="bg-[#22241e] rounded-lg p-4 overflow-y-auto">
                    <h3 className="text-sm font-bold text-[#f0f0e0] mb-2">Analysis</h3>
                    {isLoading ? <p>Analyzing...</p> : <p className="text-sm whitespace-pre-wrap">{response}</p>}
                 </div>
            </div>
            <div className="flex items-center gap-4">
                <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1 p-2 rounded bg-[#22241e] border border-[#4a4c41]"
                    placeholder="e.g., 'Summarize the plot' or 'Identify all characters'"
                />
                <Button onClick={() => fileInputRef.current?.click()} className="bg-[#5bc0de] border-[#5bc0de] hover:bg-[#6fc9e7]">Upload Video</Button>
                <Button onClick={handleAnalyze} isLoading={isLoading} disabled={!video}>Analyze</Button>
            </div>
        </div>
    );
};

export default VideoUnderstandPanel;