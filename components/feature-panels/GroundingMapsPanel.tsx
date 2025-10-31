import React, { useState, useEffect } from 'react';
import { groundWithMaps } from '../../services/geminiService';
import { GroundingChunk } from '../../types';
import Button from '../common/Button';
import ReactMarkdown from 'react-markdown';

const GroundingMapsPanel: React.FC<{ setStatusMessage: (msg: string) => void }> = ({ setStatusMessage }) => {
    const [prompt, setPrompt] = useState('What are some good cafes near me?');
    const [response, setResponse] = useState('');
    const [chunks, setChunks] = useState<GroundingChunk[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        setStatusMessage('Requesting location for map search...');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords(position.coords);
                    setLocationError(null);
                    setStatusMessage('Location acquired. Ready for map search.');
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setLocationError('Could not get location. Please allow location access and try again.');
                    setStatusMessage('Location access denied. Map search is disabled.');
                }
            );
        } else {
            setLocationError('Geolocation is not supported by this browser.');
            setStatusMessage('Geolocation is not supported.');
        }
    }, [setStatusMessage]);

    const handleSearch = async () => {
        if (!prompt.trim() || !coords) return;
        setIsLoading(true);
        setResponse('');
        setChunks([]);
        setStatusMessage('Searching maps...');
        const result = await groundWithMaps(prompt, coords);
        setResponse(result.text);
        setChunks(result.chunks);
        setStatusMessage(result.text ? 'Map search complete.' : 'Map search failed.');
        setIsLoading(false);
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full">
            <h2 className="text-lg font-bold">Map Search (Grounding)</h2>
            {locationError && <p className="text-red-400 text-sm">{locationError}</p>}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 p-2 rounded bg-[#22241e] border border-[#4a4c41] focus:outline-none focus:ring-1 focus:ring-[#4ac94a]"
                    placeholder="e.g., 'Parks nearby' or 'restaurants in downtown'"
                    disabled={isLoading || !coords}
                />
                <Button onClick={handleSearch} isLoading={isLoading} disabled={!coords}>
                    Search Maps
                </Button>
            </div>
            <div className="flex-1 bg-[#22241e] rounded-lg p-4 overflow-y-auto mt-4">
                {isLoading && <p className="text-[#999966]">Searching maps...</p>}
                {response && <ReactMarkdown className="prose prose-invert prose-sm max-w-none">{response}</ReactMarkdown>}
                {chunks.length > 0 && (
                    <div className="mt-6 border-t border-[#4a4c41] pt-4">
                        <h3 className="text-sm font-bold text-[#999966] mb-2">Sources</h3>
                        <ul className="space-y-2">
                            {chunks.map((chunk, index) => (
                                chunk.maps && (
                                    <li key={index} className="text-xs">
                                        <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-[#4ac94a] hover:underline break-all font-semibold">
                                            {chunk.maps.title || 'View on Map'}
                                        </a>
                                        {chunk.maps.placeAnswerSources?.reviewSnippets?.map((review, rIndex) => (
                                            <div key={rIndex} className="pl-4 mt-1 border-l-2 border-[#4a4c41]">
                                                <p className="italic text-[#cfcfbd]">"{review.reviewText}" - {review.author}</p>
                                                <a href={review.uri} target="_blank" rel="noopener noreferrer" className="text-[#5bc0de] hover:underline text-[10px]">Read full review</a>
                                            </div>
                                        ))}
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

export default GroundingMapsPanel;
