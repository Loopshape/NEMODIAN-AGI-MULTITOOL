
import React from 'react';
import { Feature } from '../types';
import { FEATURES_CONFIG } from '../constants';

interface LeftPanelProps {
    activeFeature: Feature;
    onSelectFeature: (feature: Feature) => void;
    isOpen: boolean;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ activeFeature, onSelectFeature, isOpen }) => {
    const baseButtonClass = "w-full text-left px-3 py-2 text-sm rounded transition-colors duration-200 flex items-center gap-3";
    const activeButtonClass = "bg-[#4ac94a] text-[#3a3c31] font-bold";
    const inactiveButtonClass = "hover:bg-[#4a4c41]";

    return (
        <aside className={`bg-[#313328] border-r border-[#22241e] p-2.5 flex flex-col gap-1 transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 md:static absolute h-full z-20 w-[240px]`}>
            <h2 className="text-xs text-[#999966] uppercase font-bold tracking-wider px-3 pb-2">Features</h2>
            {FEATURES_CONFIG.map(({ id, icon }) => (
                <button
                    key={id}
                    onClick={() => onSelectFeature(id)}
                    className={`${baseButtonClass} ${activeFeature === id ? activeButtonClass : inactiveButtonClass}`}
                >
                    <span className="text-lg">{icon}</span>
                    <span>{id}</span>
                </button>
            ))}
        </aside>
    );
};

export default LeftPanel;
