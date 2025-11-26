import React, { useEffect, useState } from "react";
import NexusCockpit3D from "./NexusCockpit3D";
import { NexusResultEnvelope } from "../services/NexusRouter";

export default function NexusCockpit3DDemo() {
  const [result, setResult] = useState<NexusResultEnvelope>();

  // Generate dummy tokens for demo
  useEffect(() => {
    const engines = ["gemini", "ollama"];
    const tokens: string[] = [];
    for (let i = 0; i < 30; i++) {
      const engine = engines[i % engines.length];
      tokens.push(`${engine}_token_${i + 1}`);
    }

    const demoResult: NexusResultEnvelope = {
      output: tokens.join(" "),
      engine: "hybrid",
      hash: "demo-hash",
      rehash: "demo-rehash",
      timestamp: new Date().toISOString(),
      entropy: Math.random(),
      tokens
    };

    // Simulate streaming: push tokens one by one
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= tokens.length) {
        clearInterval(interval);
        return;
      }
      setResult(prev => ({
        ...demoResult,
        tokens: [...(prev?.tokens || []), tokens[idx]]
      }));
      idx++;
    }, 150); // 150ms per token
  }, []);

  return (
    <div>
      <h2 className="text-white text-lg mb-2">NEXUS 3D Cockpit Demo</h2>
      <NexusCockpit3D result={result} />
    </div>
  );
}

