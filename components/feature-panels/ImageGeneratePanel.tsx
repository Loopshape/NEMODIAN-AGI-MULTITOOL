
import React, { useState } from 'react';
import { generateImage } from '../../services/geminiService';
import Button from '../common/Button';
import { ASPECT_RATIOS } from '../../constants';

interface ImageGeneratePanelProps {
    setStatusMessage: (message: string) => void;
}

const ImageGeneratePanel: React.FC<ImageGeneratePanelProps> = ({ setStatusMessage }) => {
    const [prompt, setPrompt] = useState('A photorealistic image of a futuristic city skyline at dusk, with flying cars.');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setImageUrl(null);
        setStatusMessage('Generating image...');
        const result = await generateImage(prompt, aspectRatio);
        if (result) {
            setImageUrl(result);
            setStatusMessage('Image generated successfully.');
        } else {
            setStatusMessage('Failed to generate image.');
        }
        setIsLoading(false);
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full">
            <div className="flex flex-col gap-2">
                <label htmlFor="prompt" className="text-sm font-bold">Prompt</label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a detailed description for your image"
                    className="w-full p-2 rounded bg-[#22241e] border border-[#4a4c41] focus:outline-none focus:ring-1 focus:ring-[#4ac94a] resize-none"
                    rows={3}
                />
            </div>
            <div className="flex items-center gap-4">
                 <label htmlFor="aspect-ratio" className="text-sm font-bold">Aspect Ratio</label>
                 <select
                    id="aspect-ratio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="p-2 rounded bg-[#22241e] border border-[#4a4c41] focus:outline-none focus:ring-1 focus:ring-[#4ac94a]"
                 >
                    {ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                 </select>
                <Button onClick={handleGenerate} isLoading={isLoading}>Generate Image</Button>
            </div>
            <div className="flex-1 mt-4 bg-[#22241e] rounded-lg flex items-center justify-center overflow-hidden">
                {isLoading && <div className="text-[#999966]">Generating...</div>}
                {imageUrl && <img src={imageUrl} alt="Generated" className="max-h-full max-w-full object-contain" />}
                {!isLoading && !imageUrl && <div className="text-[#999966]">Your generated image will appear here</div>}
            </div>
        </div>
    );
};

export default ImageGeneratePanel;
