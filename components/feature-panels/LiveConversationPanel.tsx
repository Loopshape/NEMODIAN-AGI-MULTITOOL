import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, LiveSession } from '@google/genai';
import { encode, decode, decodeAudioData } from '../../services/audioUtils';
import Button from '../common/Button';
import { MODEL_LIVE } from '../../constants';

type ConversationState = 'idle' | 'connecting' | 'active' | 'error';

// This is a complex component. State is managed carefully with refs to avoid stale closures.
const LiveConversationPanel: React.FC<{ setStatusMessage: (msg: string) => void }> = ({ setStatusMessage }) => {
    const [state, setState] = useState<ConversationState>('idle');
    const [transcriptions, setTranscriptions] = useState<{ user: string, model: string }[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [currentOutput, setCurrentOutput] = useState('');

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const cleanup = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(s => s.close());
            sessionPromiseRef.current = null;
        }
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        
        sourcesRef.current.forEach(s => s.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
    }, []);
    
    useEffect(() => {
      // Return cleanup function to be called on component unmount
      return cleanup;
    }, [cleanup]);

    const startConversation = async () => {
        if (state !== 'idle') return;

        setState('connecting');
        setStatusMessage('Connecting to live session...');
        
        // Reset state
        setTranscriptions([]);
        setCurrentInput('');
        setCurrentOutput('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            sessionPromiseRef.current = ai.live.connect({
                model: MODEL_LIVE,
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        setState('active');
                        setStatusMessage('Connection open. Start speaking.');
                        
                        if (!inputAudioContextRef.current) return;
                        
                        const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        
                        const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = processor;
                        
                        processor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(v => v * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        source.connect(processor);
                        processor.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setCurrentInput(prev => prev + message.serverContent.inputTranscription.text);
                        }
                        if (message.serverContent?.outputTranscription) {
                            setCurrentOutput(prev => prev + message.serverContent.outputTranscription.text);
                        }

                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInput + (message.serverContent.inputTranscription?.text || '');
                            const fullOutput = currentOutput + (message.serverContent.outputTranscription?.text || '');
                            setTranscriptions(prev => [...prev, { user: fullInput, model: fullOutput }]);
                            setCurrentInput('');
                            setCurrentOutput('');
                        }
                        
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const audioCtx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
                            const source = audioCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(audioCtx.destination);
                            source.addEventListener('ended', () => sourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                        
                         if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(s => s.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onclose: () => {
                        setStatusMessage('Session closed.');
                        setState('idle');
                        cleanup();
                    },
                    onerror: () => {
                        setStatusMessage('An error occurred in the live session.');
                        setState('error');
                        cleanup();
                    },
                }
            });

        } catch (err) {
            console.error(err);
            setStatusMessage('Failed to start conversation.');
            setState('error');
            cleanup();
        }
    };
    
    const stopConversation = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(s => s.close());
        }
        cleanup();
        setState('idle');
        setStatusMessage('Conversation ended.');
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full">
            <div className="flex gap-4">
                <Button onClick={startConversation} disabled={state !== 'idle'}>Start Conversation</Button>
                <Button onClick={stopConversation} disabled={state !== 'active' && state !== 'connecting'} className="bg-[#a03333] border-[#a03333]">Stop</Button>
                 <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${state === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className="capitalize">{state}</span>
                </div>
            </div>
            <div className="flex-1 bg-[#22241e] rounded-lg p-4 overflow-y-auto space-y-4">
                {transcriptions.map((t, i) => (
                    <div key={i}>
                        <p><strong className="text-[#4ac94a]">You:</strong> {t.user}</p>
                        <p><strong className="text-[#5bc0de]">AI:</strong> {t.model}</p>
                    </div>
                ))}
                 {(currentInput || currentOutput) && (
                    <div>
                        {currentInput && <p><strong className="text-[#4ac94a]">You:</strong> {currentInput}</p>}
                        {currentOutput && <p><strong className="text-[#5bc0de]">AI:</strong> {currentOutput}</p>}
                    </div>
                 )}
            </div>
        </div>
    );
};

export default LiveConversationPanel;