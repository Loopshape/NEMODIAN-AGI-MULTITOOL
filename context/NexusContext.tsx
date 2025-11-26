// src/context/NexusContext.tsx
import React, { createContext, useState, useContext, useCallback } from "react";
import { runNexus, NexusMode, NexusResultEnvelope } from "../services/NexusRouter";

interface NexusContextState {
  mode: NexusMode;
  setMode: (m: NexusMode) => void;

  lastResult: NexusResultEnvelope | null;
  loading: boolean;

  sendPrompt: (prompt: string) => Promise<void>;
}

const NexusContext = createContext<NexusContextState | null>(null);

export const NexusProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<NexusMode>("gemini");
  const [lastResult, setLastResult] = useState<NexusResultEnvelope | null>(null);
  const [loading, setLoading] = useState(false);

  const sendPrompt = useCallback(async (prompt: string) => {
    setLoading(true);

    try {
      const res = await runNexus(prompt, mode);
      setLastResult(res);
    } catch (err) {
      console.error(err);
      alert("NEXUS ERROR: " + err);
    }

    setLoading(false);
  }, [mode]);

  return (
    <NexusContext.Provider value={{ mode, setMode, lastResult, loading, sendPrompt }}>
      {children}
    </NexusContext.Provider>
  );
};

export const useNexus = () => {
  const ctx = useContext(NexusContext);
  if (!ctx) throw new Error("useNexus must be used inside <NexusProvider>");
  return ctx;
};

