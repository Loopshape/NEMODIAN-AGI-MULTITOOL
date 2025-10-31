
import React, { useState, useEffect, useRef } from 'react';
import { generateSpeech } from '../../services/geminiService';
import { decode, decodeAudioData } from '../../services/audioUtils';
import Button from '../common/Button';

const TextToSpeechPanel: React.FC<{ setStatusMessage: (msg: string) => void }> = ({ setStatusMessage }) => {
    const [text, setText] = useState('Hello! Welcome to the Nemodian AI interface. I can convert any text you type here into speech.');
    const [isLoading, setIsLoading] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext on user interaction to comply with browser policies
        const initAudioContext = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            window.removeEventListener('click', initAudioContext);
        };
        window.addEventListener('click', initAudioContext);
        
        return () => {
            window.removeEventListener('click', initAudioContext);
            audioContextRef.current?.close();
        }
    }, []);

    const handleGenerateAndPlay = async () => {
        if (!text.trim() || !audioContextRef.current) return;
        
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }
        
        setIsLoading(true);
        setStatusMessage('Generating speech...');
        const base64Audio = await generateSpeech(text);
        if (base64Audio && audioContextRef.current) {
            try {
                const decodedBytes = decode(base64Audio);
                const audioBuffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.start();
                setStatusMessage('Playing generated speech.');
            } catch (error) {
                console.error("Error playing audio:", error);
                setStatusMessage('Error playing audio.');
            }
        } else {
            setStatusMessage('Failed to generate speech.');
        }
        setIsLoading(false);
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full">
            <h2 className="text-lg font-bold">Text-to-Speech</h2>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="w-full p-2 rounded bg-[#22241e] border border-[#4a4c41] focus:outline-none focus:ring-1 focus:ring-[#4ac94a] resize-none"
                placeholder="Enter text to convert to speech..."
            />
            <Button onClick={handleGenerateAndPlay} isLoading={isLoading}>
                Generate and Play
            </Button>
        </div>
    );
};

export default TextToSpeechPanel;
