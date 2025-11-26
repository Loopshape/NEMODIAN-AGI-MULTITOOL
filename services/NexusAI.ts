import GeminiService from "./GeminiService";
import OllamaService from "./OllamaService";

export type NexusResult = {
  text: string;
  engine: "GEMINI" | "OLLAMA";
};

export class NexusAI {
  static async queryGemini(prompt: string): Promise<NexusResult> {
    const result = await GeminiService.run(prompt);
    return { text: result, engine: "GEMINI" };
  }

  static async queryOllama(prompt: string): Promise<NexusResult> {
    const result = await OllamaService.run(prompt);
    return { text: result, engine: "OLLAMA" };
  }

  // Router to pick engine dynamically
  static async run(prompt: string, engine: "GEMINI" | "OLLAMA" = "GEMINI") {
    if (engine === "GEMINI") return await this.queryGemini(prompt);
    return await this.queryOllama(prompt);
  }
}

