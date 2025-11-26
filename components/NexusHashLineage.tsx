// src/components/NexusHashLineage.tsx
import React from "react";
import { useNexus } from "../context/NexusContext";

export default function NexusHashLineage() {
  const { lastResult } = useNexus();

  if (!lastResult) return null;

  return (
    <div className="p-4">
      <h2 className="font-semibold mb-2">Hash Lineage</h2>

      <div className="p-3 bg-gray-100 rounded border">
        <div><strong>Hash:</strong> {lastResult.hash}</div>
        <div><strong>Rehash:</strong> {lastResult.rehash}</div>
        <div><strong>Engine:</strong> {lastResult.engine}</div>
        <div><strong>Timestamp:</strong> {lastResult.timestamp}</div>
        <div><strong>Entropy:</strong> {lastResult.entropy}</div>
      </div>
    </div>
  );
}

