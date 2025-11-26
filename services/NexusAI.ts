import * as GeminiService from "./geminiService";
import { OllamaService } from "./OllamaService";

export type NexusResult = {
  text: string;
  engine: "GEMINI" | "OLLAMA";
};

/**
 * @deprecated This class is for demonstration purposes only and is not part of the main NEXUS orchestration.
 * Use NexusRouter for orchestrated multi-model workflows.
 */
export class NexusAI {
  static async queryGemini(prompt: string): Promise<NexusResult> {
    const result = await GeminiService.generateText('gemini-2.5-flash', prompt);
    return { text: result, engine: "GEMINI" };
  }

  static async queryOllama(prompt: string): Promise<NexusResult> {
    // This is a simplified example. OllamaService's primary interface is streaming.
    // To get a full response, we'd need to collect streams.
    // This is a placeholder for what a direct non-streaming call could look like.
    let fullText = "";
    const stream = OllamaService.stream(prompt, (token) => {
        fullText += token;
    });
    await stream.promise;
    return { text: fullText, engine: "OLLAMA" };
  }

  // Router to pick engine dynamically
  static async run(prompt: string, engine: "GEMINI" | "OLLAMA" = "GEMINI") {
    if (engine === "GEMINI") return await this.queryGemini(prompt);
    return await this.queryOllama(prompt);
  }
}

