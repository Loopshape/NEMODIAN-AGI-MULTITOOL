
import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';
import { MODEL_PRO } from '../../constants';
import Button from '../common/Button';
import ReactMarkdown from 'react-markdown';

interface ThinkingModePanelProps {
    setStatusMessage: (message: string) => void;
}

const ThinkingModePanel: React.FC<ThinkingModePanelProps> = ({ setStatusMessage }) => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setResponse('');
        setStatusMessage('Engaging complex reasoning module...');
        try {
            const result = await generateText(MODEL_PRO, prompt, true);
            setResponse(result);
            setStatusMessage('Complex reasoning complete.');
        } catch (error) {
            setResponse('An error occurred. Please try again.');
            setStatusMessage('Error during complex reasoning.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-4 gap-4">
            <h2 className="text-lg font-bold text-[#f0f0e0]">Complex Reasoning (Thinking Mode)</h2>
            <p className="text-sm text-[#999966]">Use this for challenging tasks like coding problems, strategic planning, or deep analysis. The AI will use an extended "thinking" budget to provide a more thorough response.</p>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your complex prompt here..."
                className="flex-1 p-3 rounded bg-[#22241e] border border-[#4a4c41] focus:outline-none focus:ring-1 focus:ring-[#4ac94a] resize-none"
                rows={8}
            />
            <Button onClick={handleSubmit} isLoading={isLoading}>
                Execute with Thinking
            </Button>
            {response && (
                <div className="flex-1 bg-[#22241e] rounded-lg p-4 overflow-y-auto mt-4">
                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none">{response}</ReactMarkdown>
                </div>
            )}
        </div>
    );
};

export default ThinkingModePanel;
