
import React from 'react';

interface HeaderProps {
    onToggleMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleMenu }) => {
    return (
        <header className="bg-[#2e3026] border-b border-[#22241e] flex items-center justify-between px-3 py-1.5 h-[calc(1.5em*1.6)]">
            <div className="flex gap-3 items-center">
                <button onClick={onToggleMenu} className="md:hidden p-1 rounded hover:bg-[#4a4c41]">☰</button>
                <div className="font-extrabold">Nemodian 2244-1 :: AI Multi-Tool</div>
            </div>
            <div className="flex gap-2 items-center">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#4ac94a] animate-pulse"></div>
                    <div className="text-xs text-[#cfcfbd]">Gemini AI: Connected</div>
                </div>
            </div>
        </header>
    );
};

export default Header;
