import * as GeminiService from "./geminiService";
import { OllamaService } from "./OllamaService";
import { sha256 } from "../utils/crypto";

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

export enum NexusHybridMode {
  SEQUENTIAL = "sequential",
  PARALLEL = "parallel",
  ADVERSARIAL = "adversarial",
}

export interface NexusResultEnvelope {
  output: string;
  tokens: NexusToken[];
  hash: string;
  rehash: string; // Added rehash
  engine: "gemini" | "ollama";
  timestamp: number; // Changed to number for Unix ms
  entropy: string; // Added entropy-notes
  meta: Record<string, any>; // Added meta
}

export async function runNexus(
  prompt: string,
  mode: NexusMode,
  onToken?: (token: NexusToken) => void,
  hybridMode?: NexusHybridMode
): Promise<NexusResultEnvelope[]> {
  const initialHash = await sha256(prompt + Date.now().toString());

  const allTokens: NexusToken[] = [];
  const pushToken = (token: NexusToken) => {
    if (onToken) {
      onToken(token);
    }
    allTokens.push(token);
  };

  const createResultEnvelope = async (
    engine: "gemini" | "ollama",
    output: string,
    previousHash: string | null,
    meta: Record<string, any> = {},
    entropy: string = ""
  ): Promise<NexusResultEnvelope> => {
    const timestamp = Date.now();
    const currentHash = await sha256(output + timestamp.toString());
    return {
      output,
      tokens: allTokens.filter(t => t.engine === engine),
      hash: currentHash,
      rehash: previousHash || initialHash,
      engine,
      timestamp,
      entropy,
      meta,
    };
  };

  let results: NexusResultEnvelope[] = [];

  try {
    if (mode === NexusMode.GEMINI) {
      let geminiOutput = "";
      const stream = GeminiService.streamText(prompt, (value) => {
        geminiOutput += value;
        pushToken({ id: crypto.randomUUID(), engine: "gemini", value });
      });
      await stream.promise;
      results.push(
        await createResultEnvelope("gemini", geminiOutput, null, { model: "gemini-2.5-flash" })
      );
    } else if (mode === NexusMode.OLLAMA) {
      let ollamaOutput = "";
      const stream = OllamaService.stream(prompt, (value) => {
        ollamaOutput += value;
        pushToken({ id: crypto.randomUUID(), engine: "ollama", value });
      });
      await stream.promise;
      results.push(
        await createResultEnvelope("ollama", ollamaOutput, null, { model: "ollama-default" })
      );
    } else if (mode === NexusMode.HYBRID) {
      if (hybridMode === NexusHybridMode.SEQUENTIAL) {
        // G -> O -> G
        let geminiOutput1 = "";
        const geminiStream1 = GeminiService.streamText(prompt, (value) => {
          geminiOutput1 += value;
          pushToken({ id: crypto.randomUUID(), engine: "gemini", value });
        });
        await geminiStream1.promise;
        const geminiResult1 = await createResultEnvelope("gemini", geminiOutput1, null, { step: 1, model: "gemini-2.5-flash" });
        results.push(geminiResult1);

        let ollamaOutput = "";
        const ollamaStream = OllamaService.stream(geminiOutput1, (value) => {
          ollamaOutput += value;
          pushToken({ id: crypto.randomUUID(), engine: "ollama", value });
        });
        await ollamaStream.promise;
        const ollamaResult = await createResultEnvelope("ollama", ollamaOutput, geminiResult1.hash, { step: 2, model: "ollama-default" });
        results.push(ollamaResult);

        let geminiOutput2 = "";
        const geminiStream2 = GeminiService.streamText(ollamaOutput, (value) => {
          geminiOutput2 += value;
          pushToken({ id: crypto.randomUUID(), engine: "gemini", value });
        });
        await geminiStream2.promise;
        const geminiResult2 = await createResultEnvelope("gemini", geminiOutput2, ollamaResult.hash, { step: 3, model: "gemini-2.5-flash" });
        results.push(geminiResult2);

      } else if (hybridMode === NexusHybridMode.PARALLEL) {
        let geminiOutput = "";
        let ollamaOutput = "";

        const geminiStream = GeminiService.streamText(prompt, (value) => {
          geminiOutput += value;
          pushToken({ id: crypto.randomUUID(), engine: "gemini", value });
        });

        const ollamaStream = OllamaService.stream(prompt, (value) => {
          ollamaOutput += value;
          pushToken({ id: crypto.randomUUID(), engine: "ollama", value });
        });

        await Promise.all([geminiStream.promise, ollamaStream.promise]);

        const geminiResult = await createResultEnvelope("gemini", geminiOutput, null, { mode: "parallel", model: "gemini-2.5-flash" });
        const ollamaResult = await createResultEnvelope("ollama", ollamaOutput, null, { mode: "parallel", model: "ollama-default" });
        results.push(geminiResult, ollamaResult);

      } else if (hybridMode === NexusHybridMode.ADVERSARIAL) {
        // Simplified adversarial: run in parallel, then prompt each model to critique the other's output
        let geminiOutput = "";
        let ollamaOutput = "";

        const geminiStream = GeminiService.streamText(prompt, (value) => {
          geminiOutput += value;
          pushToken({ id: crypto.randomUUID(), engine: "gemini", value });
        });

        const ollamaStream = OllamaService.stream(prompt, (value) => {
          ollamaOutput += value;
          pushToken({ id: crypto.randomUUID(), engine: "ollama", value });
        });

        await Promise.all([geminiStream.promise, ollamaStream.promise]);

        const geminiResult = await createResultEnvelope("gemini", geminiOutput, null, { mode: "adversarial", model: "gemini-2.5-flash" });
        const ollamaResult = await createResultEnvelope("ollama", ollamaOutput, null, { mode: "adversarial", model: "ollama-default" });
        results.push(geminiResult, ollamaResult);

        // Adversarial step: Gemini critiques Ollama
        let geminiCritique = "";
        const critiquePromptG = `Critique the following response from Ollama:\n\n"${ollamaOutput}"\n\nBased on the original prompt: "${prompt}"`;
        const geminiCritiqueStream = GeminiService.streamText(critiquePromptG, (value) => {
          geminiCritique += value;
          pushToken({ id: crypto.randomUUID(), engine: "gemini", value });
        });
        await geminiCritiqueStream.promise;
        results.push(await createResultEnvelope("gemini", geminiCritique, ollamaResult.hash, { mode: "adversarial_critique", target: "ollama", model: "gemini-2.5-flash" }));

        // Adversarial step: Ollama critiques Gemini
        let ollamaCritique = "";
        const critiquePromptO = `Critique the following response from Gemini:\n\n"${geminiOutput}"\n\nBased on the original prompt: "${prompt}"`;
        const ollamaCritiqueStream = OllamaService.stream(critiquePromptO, (value) => {
          ollamaCritique += value;
          pushToken({ id: crypto.randomUUID(), engine: "ollama", value });
        });
        await ollamaCritiqueStream.promise;
        results.push(await createResultEnvelope("ollama", ollamaCritique, geminiResult.hash, { mode: "adversarial_critique", target: "gemini", model: "ollama-default" }));
      }
    }
  } catch (error) {
    console.error("Error in runNexus:", error);
    // Handle error, perhaps return an error envelope
  }

  return results;
}

