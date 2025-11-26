import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNexus } from '../../context/NexusContext';
import { NexusToken } from '../../services/NexusRouter';
import NexusEngineSelector from '../NexusEngineSelector';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    engine?: 'gemini' | 'ollama';
}

const ChatPanel: React.FC = () => {
    const { sendPrompt, loading } = useNexus();
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [prompt, setPrompt] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleSend = useCallback(async () => {
        if (!prompt.trim() || loading) return;

        const userMessage: ChatMessage = { role: 'user', text: prompt };
        setHistory(prev => [...prev, userMessage]);
        setPrompt('');

        const modelMessage: ChatMessage = { role: 'model', text: '', engine: 'gemini' }; // default engine
        setHistory(prev => [...prev, modelMessage]);

        await sendPrompt(prompt, (token: NexusToken) => {
            setHistory(prev => {
                const newHistory = [...prev];
                const lastMessage = newHistory[newHistory.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.text += token.value;
                    lastMessage.engine = token.engine;
                }
                return newHistory;
            });
        });
    }, [prompt, loading, sendPrompt]);

    return (
        <div className="flex flex-col h-full p-4 gap-4">
            <h2 className="text-lg font-bold text-[#f0f0e0]">NEXUS Chat</h2>
            <NexusEngineSelector />
            <div className="flex-1 bg-[#22241e] rounded-lg p-4 overflow-y-auto space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl p-3 rounded-lg whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#4ac94a] text-[#3a3c31]' : 'bg-[#4a4c41]'}`}>
                            {msg.role === 'model' && msg.engine && <span className="text-xs font-bold uppercase text-gray-400">{msg.engine}</span>}
                            <div className="text-sm">{msg.text}</div>
                            {loading && msg.role === 'model' && index === history.length - 1 && <Spinner />}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 p-2 rounded bg-[#22241e] border border-[#4a4c41] focus:outline-none focus:ring-1 focus:ring-[#4ac94a]"
                    disabled={loading}
                    aria-label="Your message to the AI"
                />
                <Button onClick={handleSend} isLoading={loading} aria-label="Send message">Send</Button>
            </div>
        </div>
    );
};

export default ChatPanel;