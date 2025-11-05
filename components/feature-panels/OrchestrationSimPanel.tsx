
import React, { useState, useCallback } from 'react';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

interface OrchestrationSimPanelProps {
    setStatusMessage: (message: string) => void;
}

const AGENT_COUNT = 5; // Fixed number of conceptual agents for this simulation

const OrchestrationSimPanel: React.FC<OrchestrationSimPanelProps> = ({ setStatusMessage }) => {
    const [genesisHash, setGenesisHash] = useState<string | null>(null);
    const [originHashes, setOriginHashes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const generateSha256 = useCallback(async (input: string): Promise<string> => {
        const textEncoder = new TextEncoder();
        const data = textEncoder.encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hexHash;
    }, []);

    const handleGenerateHashes = useCallback(async () => {
        setIsLoading(true);
        setGenesisHash(null);
        setOriginHashes([]);
        setStatusMessage('Generating genesis hash and origin hashes...');

        try {
            // Step 1: Generate Genesis Hash (from timestamp as root-level)
            const timestamp = new Date().toISOString();
            const genHash = await generateSha256(timestamp);
            setGenesisHash(genHash);
            setStatusMessage('Genesis hash generated. Assigning origin hashes...');

            // Step 2: Assign Origin Hashes (derived from genesis-hash + agent index)
            const newOriginHashes: string[] = [];
            for (let i = 0; i < AGENT_COUNT; i++) {
                // Using 2*PI / AGENT_COUNT for conceptual "2π/5" distribution
                const agentSpecificInput = `${genHash}-${i}-${(2 * Math.PI * i) / AGENT_COUNT}`;
                const originHash = await generateSha256(agentSpecificInput);
                newOriginHashes.push(originHash);
            }
            setOriginHashes(newOriginHashes);
            setStatusMessage(`Orchestration hashes generated for ${AGENT_COUNT} conceptual agents.`);

        } catch (error) {
            console.error("Error generating hashes:", error);
            setStatusMessage('Error during hash generation.');
        } finally {
            setIsLoading(false);
        }
    }, [generateSha256, setStatusMessage]);

    return (
        <div className="p-4 flex flex-col gap-4 h-full">
            <h2 className="text-lg font-bold">Orchestration Protocol Simulation</h2>
            <p className="text-sm text-[#999966]">
                This panel conceptually demonstrates the "Quantum-Fractal Orchestration Process" as described in the protocol document.
                It simulates the generation of a root-level genesis hash and derives unique origin hashes for conceptual agents using client-side SHA-256.
                <br /><br />
                <strong>Note:</strong> A full, secure, multi-agent orchestration system with "thinking pools" and "re-hashed origin-traces" would require a sophisticated backend implementation. This is a frontend simulation for illustrative purposes only.
            </p>
            
            <Button onClick={handleGenerateHashes} isLoading={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Orchestration Hashes'}
            </Button>

            <div className="flex-1 bg-[#22241e] rounded-lg p-4 overflow-y-auto space-y-4 text-sm break-all">
                {isLoading && <div className="text-center text-[#999966]"><Spinner /> Generating Hashes...</div>}
                
                {genesisHash && (
                    <div>
                        <h3 className="font-bold text-[#4ac94a] mb-1">Root Genesis Hash (Timestamp-derived)</h3>
                        <p className="p-2 bg-[#313328] rounded-md">{genesisHash}</p>
                    </div>
                )}

                {originHashes.length > 0 && (
                    <div>
                        <h3 className="font-bold text-[#5bc0de] mb-1 mt-4">Agent Origin Hashes ({AGENT_COUNT} Agents)</h3>
                        <ul className="space-y-2">
                            {originHashes.map((hash, index) => (
                                <li key={index} className="p-2 bg-[#313328] rounded-md">
                                    <strong>Agent {index + 1}:</strong> {hash}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isLoading && !genesisHash && <p className="text-[#999966]">Click "Generate Orchestration Hashes" to begin the simulation.</p>}
            </div>
        </div>
    );
};

export default OrchestrationSimPanel;