
import React, { useState, useCallback, useEffect } from 'react';
import { Feature, OllamaStatus } from './types';
import { FEATURES_CONFIG } from './constants';
import LeftPanel from './components/LeftPanel';
import MainContent from './components/MainContent';
import Header from './components/Header';
import StatusBar from './components/StatusBar';
import Footer from './components/Footer';
import { OllamaService } from './services/OllamaService';

const App: React.FC = () => {
    const [activeFeature, setActiveFeature] = useState<Feature>(Feature.CHAT);
    const [statusMessage, setStatusMessage] = useState('Welcome to Nemodian 2244-1! Select a feature to get started.');
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
    const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('checking');

    useEffect(() => {
        const checkOllama = async () => {
            const isOnline = await OllamaService.checkStatus();
            setOllamaStatus(isOnline ? 'online' : 'offline');
        };
        checkOllama();
    }, []);

    const handleFeatureSelect = useCallback((feature: Feature) => {
        setActiveFeature(feature);
        const featureConfig = FEATURES_CONFIG.find(f => f.id === feature);
        setStatusMessage(featureConfig?.description || `Switched to ${feature}`);
    }, []);

    const toggleLeftPanel = () => {
        setIsLeftPanelOpen(prev => !prev);
    };

    return (
        <div className="h-screen w-screen bg-[#3a3c31] text-[#f0f0e0] font-mono text-[13px] flex flex-col overflow-hidden">
            <Header onToggleMenu={toggleLeftPanel} />
            <StatusBar message={statusMessage} ollamaStatus={ollamaStatus} />
            <main className="flex-1 grid grid-cols-1 md:grid-cols-[240px_1fr] overflow-hidden">
                <LeftPanel
                    activeFeature={activeFeature}
                    onSelectFeature={handleFeatureSelect}
                    isOpen={isLeftPanelOpen}
                />
                <div className="flex-1 bg-[#313328] overflow-auto">
                   <MainContent activeFeature={activeFeature} setStatusMessage={setStatusMessage} />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;
