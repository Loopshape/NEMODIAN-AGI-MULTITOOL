import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useNexus } from "../context/NexusContext";
import { NexusMode } from "../services/NexusRouter"; // Import NexusMode for explicit mode setting

// Temporarily define AIPanel outside if it's not a generic type in your project
interface AIPanel {
  id: number;
  engine: "gemini" | "ollama" | "nexus"; // Updated engine type
  output: string;
}

const NexusCockpit3D: React.FC = () => {
  const cockpitRef = useRef<THREE.Group>(null);
  const { sendPrompt, loading, lastResult, setMode, setHybridMode } = useNexus();
  const [panels, setPanels] = useState<AIPanel[]>([]);

  useFrame((state, delta) => {
    if (cockpitRef.current) cockpitRef.current.rotation.y += delta * 0.1;
  });

  useEffect(() => {
    if (lastResult && lastResult.length > 0) {
      // Update panels based on the last result from NexusContext
      setPanels(lastResult.map(res => ({
        id: Date.now() + Math.random(), // Unique ID for each result envelope
        engine: res.engine,
        output: res.output,
      })));
    }
  }, [lastResult]);

  const triggerPrompt = async (targetEngine: "gemini" | "ollama", prompt: string) => {
    setPanels((prev) => [...prev, { id: Date.now(), engine: targetEngine, output: "⏳ Generating..." }]);
    // Set the mode for NexusContext
    if (targetEngine === "gemini") {
        setMode(NexusMode.GEMINI);
        setHybridMode(undefined);
    } else if (targetEngine === "ollama") {
        setMode(NexusMode.OLLAMA);
        setHybridMode(undefined);
    }
    // sendPrompt will update lastResult, which triggers the useEffect above
    await sendPrompt(prompt);
  };

  return (
    <group ref={cockpitRef}>
      {/* Cockpit base */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[3, 0.5, 2]} />
        <meshStandardMaterial color="#f92672" />
      </mesh>

      {/* Gemini trigger button */}
      <mesh position={[-1, 1.2, 1]} scale={[0.5, 0.1, 0.5]} onClick={() => triggerPrompt("gemini", "Generate system status")}>
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color="#fd971f" />
      </mesh>

      {/* Ollama trigger button */}
      <mesh position={[1, 1.2, 1]} scale={[0.5, 0.1, 0.5]} onClick={() => triggerPrompt("ollama", "Generate AI report")}>
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color="#a6e22e" />
      </mesh>

      {/* Render panels as floating text */}
      {panels.map((panel, index) => (
        <mesh key={panel.id} position={[0, 2 + index * 0.5, -0.5]}>
          <textGeometry args={[panel.output.substring(0, 50), { size: 0.15, height: 0.02 }]} /> {/* Truncate output for display */}
          <meshStandardMaterial color={panel.engine === "gemini" ? "#fd971f" : "#a6e22e"} />
        </mesh>
      ))}
    </group>
  );
};

export default NexusCockpit3D;

