
import React, { useState, useRef } from 'react';
import { understandImage } from '../../services/geminiService';
import Button from '../common/Button';

interface ImageUnderstandPanelProps {
    setStatusMessage: (message: string) => void;
}

const ImageUnderstandPanel: React.FC<ImageUnderstandPanelProps> = ({ setStatusMessage }) => {
    const [prompt, setPrompt] = useState('What is in this image?');
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResponse('');
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAnalyze = async () => {
        if (!prompt.trim() || !imageFile || !image) return;
        setIsLoading(true);
        setResponse('');
        setStatusMessage('Analyzing image...');
        const base64 = image.split(',')[1];
        const result = await understandImage(prompt, base64, imageFile.type);
        setResponse(result);
        setStatusMessage(result ? 'Analysis complete.' : 'Analysis failed.');
        setIsLoading(false);
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full">
            <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                <div className="bg-[#22241e] rounded-lg flex flex-col items-center justify-center p-2 overflow-hidden">
                    {image ? <img src={image} alt="To analyze" className="max-h-full max-w-full object-contain" /> : <p className="text-[#999966]">Upload an image to analyze</p>}
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
                />
                <Button onClick={() => fileInputRef.current?.click()} className="bg-[#5bc0de] border-[#5bc0de] hover:bg-[#6fc9e7]">Upload</Button>
                <Button onClick={handleAnalyze} isLoading={isLoading} disabled={!image}>Analyze</Button>
            </div>
        </div>
    );
};

export default ImageUnderstandPanel;
