// src/components/NexusOutputConsole.tsx
import React from "react";
import { useNexus } from "../context/NexusContext";

export default function NexusOutputConsole() {
  const { lastResult } = useNexus();

  if (!lastResult) return <div className="p-4 text-gray-400">No output yet.</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">NEXUS Output</h2>

      <pre className="mt-2 p-3 w-full bg-black text-green-400 rounded overflow-auto whitespace-pre-wrap">
        {lastResult.output}
      </pre>
    </div>
  );
}

