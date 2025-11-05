import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage } from '../../types';
import { createChatSession, streamChatMessage } from '../../services/geminiService';
import { MODEL_FLASH, MODEL_FLASH_LITE } from '../../constants';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

interface ChatPanelProps {
    setStatusMessage: (message: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ setStatusMessage }) => {
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [prompt, setPrompt] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState(MODEL_FLASH);
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const systemPromptTimeoutRef = useRef<number | null>(null);

    // Effect to (re)initialize chat session only when selectedModel changes or on initial mount.
    // When the model changes, the history is cleared as it's typically a new conversational context.
    useEffect(() => {
        setHistory([]); // Reset history when model changes
        chatRef.current = createChatSession(selectedModel, systemPrompt.trim() || undefined);
        setStatusMessage(`New chat session started with model: ${selectedModel}.`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedModel]); // Only re-create on model change

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    // Debounced handler for system prompt changes.
    // This function will be called only after the user pauses typing.
    const handleDebouncedSystemPromptChange = useCallback(async (newSystemPrompt: string) => {
        if (isLoading) {
            setStatusMessage('Please wait for the current AI operation to complete before changing the system instruction.');
            return;
        }

        // Capture the current UI history to pass to the new chat session
        const currentUiHistory = history.map(msg => ({ role: msg.role, parts: msg.parts }));

        // Create a new chat session with the updated system instruction and existing history
        const newChatSession = createChatSession(selectedModel, newSystemPrompt.trim() || undefined, currentUiHistory);
        chatRef.current = newChatSession; // Update the ref to point to the new session

        let statusMsg = `System instruction updated. Chat context retained.`;
        if (newSystemPrompt.trim()) {
            statusMsg += ` New instruction applied.`;
        } else {
            statusMsg += ` Instruction cleared.`;
        }
        setStatusMessage(statusMsg);

        // Send an internal message to the model in the *new session* to explicitly inform it.
        // This message is for internal context update, not for display in UI history.
        const instructionMessage = newSystemPrompt.trim()
            ? `System instruction has been updated. The new instruction is: "${newSystemPrompt.trim()}". Please acknowledge this change concisely, without reiterating the instruction itself.`
            : 'System instruction has been cleared. Please acknowledge this change concisely.';

        // Use streaming for AI acknowledgment to meet the requirement
        setIsLoading(true); // Temporarily set loading for the acknowledgment
        setStatusMessage('AI is acknowledging system instruction update...');
        try {
            const stream = await streamChatMessage(newChatSession, instructionMessage);
            let acknowledgmentText = '';
            for await (const chunk of stream) {
                acknowledgmentText += chunk.text;
                // Update status message with streaming progress, but don't add to chat history
                setStatusMessage(`AI acknowledgment: ${acknowledgmentText.substring(0, 50)}${acknowledgmentText.length > 50 ? '...' : ''}`);
            }
            setStatusMessage('AI acknowledged system instruction update.');
        } catch (e: any) {
            console.error("Failed to stream internal system prompt update message:", e);
            setStatusMessage(`Failed to inform AI about system instruction change: ${e.message || 'Unknown error'}.`);
        } finally {
            setIsLoading(false);
        }
    }, [history, selectedModel, isLoading, setStatusMessage]); // Dependencies to ensure current state and prevention of race conditions

    // Handler for real-time system prompt input changes with debouncing.
    const handleSystemPromptInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newPrompt = e.target.value;
        setSystemPrompt(newPrompt); // Update UI immediately

        if (systemPromptTimeoutRef.current) {
            clearTimeout(systemPromptTimeoutRef.current);
        }

        systemPromptTimeoutRef.current = window.setTimeout(() => {
            handleDebouncedSystemPromptChange(newPrompt);
        }, 1000); // Debounce for 1 second
    }, [handleDebouncedSystemPromptChange]);


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

    const lastModelResponseText = useMemo(() => {
        // Find the latest message that is from the model and has content
        const lastModelMsg = history.slice().reverse().find(msg => msg.role === 'model' && msg.parts[0].text.trim() !== '');
        return lastModelMsg ? lastModelMsg.parts[0].text : '';
    }, [history]);

    const handleCopyLastResponse = useCallback(async () => {
        if (lastModelResponseText) {
            try {
                await navigator.clipboard.writeText(lastModelResponseText);
                setStatusMessage('AI response copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy text: ', err);
                setStatusMessage('Failed to copy AI response.');
            }
        }
    }, [lastModelResponseText, setStatusMessage]);

    return (
        <div className="flex flex-col h-full p-4 gap-4">
            <h2 className="text-lg font-bold text-[#f0f0e0]">Chat</h2>
            <div className="flex flex-col gap-2">
                <label htmlFor="system-prompt" className="text-sm font-bold text-[#f0f0e0]">System Instruction (Optional)</label>
                <textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={handleSystemPromptInputChange}
                    placeholder="e.g., You are a friendly helpful assistant, always respond with a positive tone."
                    className="w-full p-2 rounded bg-[#22241e] border border-[#4a4c41] focus:outline-none focus:ring-1 focus:ring-[#4ac94a] resize-none"
                    rows={3}
                    disabled={isLoading}
                    aria-label="System instruction for the AI"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="chat-model" className="text-sm font-bold text-[#f0f0e0]">Select Model</label>
                <select
                    id="chat-model"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-2 rounded bg-[#22241e] border border-[#4a4c41] focus:outline-none focus:ring-1 focus:ring-[#4ac94a]"
                    disabled={isLoading}
                    aria-label="Select AI model"
                >
                    <option value={MODEL_FLASH}>Gemini 2.5 Flash (Standard)</option>
                    <option value={MODEL_FLASH_LITE}>Gemini Flash Lite (Low Latency)</option>
                </select>
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
            {lastModelResponseText && !isLoading && (
                 <div className="flex justify-start mt-2">
                     <Button 
                        onClick={handleCopyLastResponse} 
                        aria-label="Copy last AI response" 
                        className="px-3 py-1.5 text-xs bg-[#5bc0de] border-[#5bc0de] hover:bg-[#6fc9e7]"
                    >
                        Copy Response
                    </Button>
                 </div>
            )}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 p-2 rounded bg-[#22241e] border border-[#4a4c41] focus:outline-none focus:ring-1 focus:ring-[#4ac94a]"
                    disabled={isLoading}
                    aria-label="Your message to the AI"
                />
                <Button onClick={handleSend} isLoading={isLoading} aria-label="Send message">Send</Button>
            </div>
        </div>
    );
};

export default ChatPanel;