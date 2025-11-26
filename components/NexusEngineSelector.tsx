// src/components/NexusEngineSelector.tsx
import React from "react";
import { useNexus } from "../context/NexusContext";
import { NexusMode } from "../services/NexusRouter";

const modes: { label: string; value: NexusMode }[] = [
  { label: "Gemini", value: "gemini" },
  { label: "Ollama", value: "ollama" },
  { label: "Hybrid: Sequential", value: "hybrid_seq" },
  { label: "Hybrid: Parallel", value: "hybrid_parallel" },
  { label: "Hybrid: Adversarial", value: "hybrid_adv" }
];

export default function NexusEngineSelector() {
  const { mode, setMode } = useNexus();

  return (
    <div className="flex gap-2 flex-wrap p-2">
      {modes.map(m => (
        <button
          key={m.value}
          onClick={() => setMode(m.value)}
          className={`px-3 py-1 rounded border text-sm ${
            mode === m.value ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

