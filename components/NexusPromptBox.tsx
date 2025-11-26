// src/components/NexusPromptBox.tsx
import React, { useState } from "react";
import { useNexus } from "../context/NexusContext";

export default function NexusPromptBox() {
  const { sendPrompt, loading } = useNexus();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    sendPrompt(text);
  };

  return (
    <div className="p-4 flex flex-col gap-2">
      <textarea
        className="w-full h-32 p-3 border rounded bg-gray-50"
        placeholder="Enter your NEXUS prompt..."
        value={text}
        onChange={e => setText(e.target.value)}
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="px-4 py-2 rounded bg-green-600 text-white disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Run NEXUS"}
      </button>
    </div>
  );
}

