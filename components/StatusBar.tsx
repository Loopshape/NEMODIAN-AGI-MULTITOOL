
import React from 'react';

interface StatusBarProps {
    message: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ message }) => {
    return (
        <div className="bg-[#22241e] flex justify-between items-center px-3 py-1 text-xs h-[1.5em]">
            <div>{message}</div>
        </div>
    );
};

export default StatusBar;
