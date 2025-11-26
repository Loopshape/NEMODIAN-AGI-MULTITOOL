import { GeminiService } from "./geminiService";
import { OllamaService } from "./OllamaService";

export enum NexusMode {
  GEMINI,
  OLLAMA,
  HYBRID
}

export interface NexusToken {
  id: string;
  engine: "gemini" | "ollama";
  value: string;
}

export interface NexusResultEnvelope {
  output: string;
  tokens: NexusToken[];
  hash: string;
  timestamp: string;
}

export function runNexus(
  prompt: string,
  mode: NexusMode,
  onToken?: (token: NexusToken) => void
) {
  let cancelled = false;

  const pushToken = (token: NexusToken) => {
    if (!cancelled && onToken) onToken(token);
  };

  // Gemini stream
  if (mode === NexusMode.GEMINI || mode === NexusMode.HYBRID) {
    GeminiService.stream(prompt, (value) =>
      pushToken({ id: crypto.randomUUID(), engine: "gemini", value })
    );
  }

  // Ollama stream
  if (mode === NexusMode.OLLAMA || mode === NexusMode.HYBRID) {
    OllamaService.stream(prompt, (value) =>
      pushToken({ id: crypto.randomUUID(), engine: "ollama", value })
    );
  }

  return { cancel: () => (cancelled = true) };
}

