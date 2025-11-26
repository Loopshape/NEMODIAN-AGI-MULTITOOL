// src/context/NexusContext.tsx
import React, { createContext, useState, useContext, useCallback } from "react";
import { runNexus, NexusMode, NexusToken, NexusResultEnvelope, NexusHybridMode } from "../services/NexusRouter";

interface NexusContextState {
  mode: NexusMode;
  setMode: (m: NexusMode) => void;
  hybridMode?: NexusHybridMode;
  setHybridMode: (h?: NexusHybridMode) => void;

  lastResult: NexusResultEnvelope[] | null;
  loading: boolean;

  sendPrompt: (prompt: string, onToken?: (token: NexusToken) => void) => Promise<void>;
}

const NexusContext = createContext<NexusContextState | null>(null);

export const NexusProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<NexusMode>(NexusMode.OLLAMA);
  const [hybridMode, setHybridMode] = useState<NexusHybridMode | undefined>(undefined);
  const [lastResult, setLastResult] = useState<NexusResultEnvelope[] | null>(null);
  const [loading, setLoading] = useState(false);

  const sendPrompt = useCallback(async (prompt: string, onToken?: (token: NexusToken) => void) => {
    setLoading(true);
    setLastResult(null);

    try {
      const results = await runNexus(prompt, mode, onToken, hybridMode);
      setLastResult(results);
    } catch (err) {
      console.error(err);
      // It's better to handle errors in the UI, but for now, an alert is a placeholder
      alert("NEXUS ERROR: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [mode, hybridMode]);

  return (
    <NexusContext.Provider value={{ mode, setMode, hybridMode, setHybridMode, lastResult, loading, sendPrompt }}>
      {children}
    </NexusContext.Provider>
  );
};

export const useNexus = () => {
  const ctx = useContext(NexusContext);
  if (!ctx) throw new Error("useNexus must be used inside <NexusProvider>");
  return ctx;
};

