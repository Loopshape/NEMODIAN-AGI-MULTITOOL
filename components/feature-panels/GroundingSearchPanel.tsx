import React, { useState } from 'react';
import { groundWithSearch } from '../../services/geminiService';
import { GroundingChunk } from '../../types';
import Button from '../common/Button';
import ReactMarkdown from 'react-markdown';

const GroundingSearchPanel: React.FC<{ setStatusMessage: (msg: string) => void }> = ({ setStatusMessage }) => {
    const [prompt, setPrompt] = useState('Who won the latest Formula 1 Grand Prix and what were the key moments?');
    const [response, setResponse] = useState('');
    const [chunks, setChunks] = useState<GroundingChunk[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setResponse('');
        setChunks([]);
        setStatusMessage('Searching the web for answers...');
        const result = await groundWithSearch(prompt);
        setResponse(result.text);
        setChunks(result.chunks);
        setStatusMessage(result.text ? 'Search complete.' : 'Search failed.');
        setIsLoading(false);
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full">
            <h2 className="text-lg font-bold">Web Search (Grounding)</h2>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 p-2 rounded bg-[#22241e] border border-[#4a4c41] focus:outline-none focus:ring-1 focus:ring-[#4ac94a]"
                    placeholder="Ask a question requiring up-to-date information..."
                    disabled={isLoading}
                />
                <Button onClick={handleSearch} isLoading={isLoading}>Search</Button>
            </div>
            <div className="flex-1 bg-[#22241e] rounded-lg p-4 overflow-y-auto mt-4">
                {isLoading && <p className="text-[#999966]">Searching the web...</p>}
                {response && <ReactMarkdown className="prose prose-invert prose-sm max-w-none">{response}</ReactMarkdown>}
                {chunks.length > 0 && (
                    <div className="mt-6 border-t border-[#4a4c41] pt-4">
                        <h3 className="text-sm font-bold text-[#999966] mb-2">Sources</h3>
                        <ul className="space-y-2">
                            {chunks.map((chunk, index) => (
                                chunk.web && (
                                    <li key={index} className="text-xs">
                                        <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[#4ac94a] hover:underline break-all">
                                            {chunk.web.title || chunk.web.uri}
                                        </a>
                                    </li>
                                )
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroundingSearchPanel;
