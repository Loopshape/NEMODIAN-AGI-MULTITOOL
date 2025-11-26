
import React from 'react';

type OllamaStatus = 'online' | 'offline' | 'checking';

interface StatusBarProps {
    message: string;
    ollamaStatus: OllamaStatus;
}

const StatusBar: React.FC<StatusBarProps> = ({ message, ollamaStatus }) => {
    const statusConfig = {
        online: { text: 'OLLAMA: ONLINE', color: 'text-green-400' },
        offline: { text: 'OLLAMA: OFFLINE', color: 'text-red-400' },
        checking: { text: 'OLLAMA: CHECKING...', color: 'text-yellow-400' },
    };

    const { text, color } = statusConfig[ollamaStatus];

    return (
        <div className="bg-[#22241e] flex justify-between items-center px-3 py-1 text-xs h-[1.5em]">
            <div>{message}</div>
            <div className={`font-mono ${color}`}>{text}</div>
        </div>
    );
};

export default StatusBar;

