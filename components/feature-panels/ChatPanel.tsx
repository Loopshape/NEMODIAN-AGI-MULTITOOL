
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage } from '../../types';
import { createChatSession, streamChatMessage } from '../../services/geminiService';
import { MODEL_FLASH } from '../../constants';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

interface ChatPanelProps {
    setStatusMessage: (message: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ setStatusMessage }) => {
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [prompt, setPrompt] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Effect to initialize/re-initialize chat session when systemPrompt changes
    useEffect(() => {
        setHistory([]); // Clear history on new session
        chatRef.current = createChatSession(MODEL_FLASH, systemPrompt.trim() || undefined);
        if (systemPrompt.trim()) {
            setStatusMessage('Chat session re-initialized with new system instruction.');
        } else {
            setStatusMessage('Chat session started. Type a message to begin.');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [systemPrompt]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleSend = useCallback(async () => {
        if (!prompt.trim() || isLoading || !chatRef.current) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: prompt }] };
        setHistory(prev => [...prev, userMessage]);
        setPrompt('');
        setIsLoading(true);
        setStatusMessage('AI is thinking...');
        
        const modelMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
        setHistory(prev => [...prev, modelMessage]);

        try {
            const stream = await streamChatMessage(chatRef.current, prompt);
            let fullResponse = '';
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                fullResponse += chunkText;
                setHistory(prev => {
                    const newHistory = [...prev];
                    const lastMessage = newHistory[newHistory.length - 1];
                    if (lastMessage.role === 'model') {
                        lastMessage.parts[0].text = fullResponse;
                    }
                    return newHistory;
                });
            }
            setStatusMessage('AI response received.');
        } catch (error) {
            console.error(error);
            setHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].parts[0].text = "Sorry, something went wrong.";
                return newHistory;
            });
            setStatusMessage('Error receiving response.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading, setStatusMessage]);

    return (
        <div className="flex flex-col h-full p-4 gap-4">
            <h2 className="text-lg font-bold text-[#f0f0e0]">Chat</h2>
            <div className="flex flex-col gap-2">
                <label htmlFor="system-prompt" className="text-sm font-bold text-[#f0f0e0]">System Instruction (Optional)</label>
                <textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="e.g., You are a friendly helpful assistant, always respond with a positive tone."
                    className="w-full p-2 rounded bg-[#22241e] border border-[#4a4c41] focus:outline-none focus:ring-1 focus:ring-[#4ac94a] resize-none"
                    rows={3}
                    disabled={isLoading}
                />
            </div>
            <div className="flex-1 bg-[#22241e] rounded-lg p-4 overflow-y-auto space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl p-3 rounded-lg whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#4ac94a] text-[#3a3c31]' : 'bg-[#4a4c41]'}`}>
                            {msg.parts[0].text}
                            {isLoading && msg.role === 'model' && index === history.length - 1 && <Spinner />}
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
                    disabled={isLoading}
                />
                <Button onClick={handleSend} isLoading={isLoading}>Send</Button>
            </div>
        </div>
    );
};

export default ChatPanel;