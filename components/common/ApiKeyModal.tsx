
import React from 'react';

interface ApiKeyModalProps {
    onSelectKey: () => void;
    onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSelectKey, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-[#313328] p-6 rounded-lg shadow-2xl max-w-md w-full border border-[#4a4c41]">
                <h2 className="text-xl font-bold text-white mb-4">API Key Required</h2>
                <p className="text-[#cfcfbd] mb-4">
                    Video generation with Veo requires you to select your own API key.
                    Please ensure your project is set up for billing.
                </p>
                <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#4ac94a] hover:underline text-sm mb-6 block"
                >
                    Learn more about billing
                </a>
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 rounded text-sm font-bold bg-gray-600 hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onSelectKey}
                        className="px-4 py-2 rounded text-sm font-bold bg-[#4ac94a] text-[#3a3c31] hover:bg-[#5ae05a] transition-colors"
                    >
                        Select API Key
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
