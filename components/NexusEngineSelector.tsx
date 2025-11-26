import React from "react";
import { useNexus } from "../context/NexusContext";
import { NexusMode, NexusHybridMode } from "../services/NexusRouter";

interface ModeOption {
    label: string;
    mode: NexusMode;
    hybridMode?: NexusHybridMode;
}

const modes: ModeOption[] = [
    { label: "Ollama", mode: NexusMode.OLLAMA },
    { label: "Gemini", mode: NexusMode.GEMINI },
    { label: "Sequential", mode: NexusMode.HYBRID, hybridMode: NexusHybridMode.SEQUENTIAL },
    { label: "Parallel", mode: NexusMode.HYBRID, hybridMode: NexusHybridMode.PARALLEL },
    { label: "Adversarial", mode: NexusMode.HYBRID, hybridMode: NexusHybridMode.ADVERSARIAL },
];

export default function NexusEngineSelector() {
    const { mode, hybridMode, setMode, setHybridMode } = useNexus();

    const handleModeChange = (selected: ModeOption) => {
        setMode(selected.mode);
        if (selected.mode === NexusMode.HYBRID) {
            setHybridMode(selected.hybridMode);
        } else {
            setHybridMode(undefined);
        }
    };

    return (
        <div className="flex gap-2 flex-wrap p-2">
            {modes.map(m => {
                const isActive = mode === m.mode && (m.mode !== NexusMode.HYBRID || hybridMode === m.hybridMode);
                return (
                    <button
                        key={m.label}
                        onClick={() => handleModeChange(m)}
                        className={`px-3 py-1 rounded border text-sm ${isActive ? "bg-blue-600 text-white" : "bg-gray-700"}`}
                    >
                        {m.label}
                    </button>
                )
            })}
        </div>
    );
}

