import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { NexusAI, NexusResult } from "../services/NexusAI";

interface AIPanel {
  id: number;
  engine: "GEMINI" | "OLLAMA";
  output: string;
}

const NexusCockpit3D: React.FC = () => {
  const cockpitRef = useRef<THREE.Group>(null);
  const [panels, setPanels] = useState<AIPanel[]>([]);

  useFrame((state, delta) => {
    if (cockpitRef.current) cockpitRef.current.rotation.y += delta * 0.1;
  });

  const addPanel = async (engine: "GEMINI" | "OLLAMA", prompt: string) => {
    const id = Date.now();
    setPanels((prev) => [...prev, { id, engine, output: "⏳ Generating..." }]);
    const result: NexusResult = await NexusAI.run(prompt, engine);
    setPanels((prev) =>
      prev.map((p) => (p.id === id ? { ...p, output: result.text } : p))
    );
  };

  return (
    <group ref={cockpitRef}>
      {/* Cockpit base */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[3, 0.5, 2]} />
        <meshStandardMaterial color="#f92672" />
      </mesh>

      {/* Gemini trigger button */}
      <mesh position={[-1, 1.2, 1]} scale={[0.5, 0.1, 0.5]} onClick={() => addPanel("GEMINI", "Generate system status")}>
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color="#fd971f" />
      </mesh>

      {/* Ollama trigger button */}
      <mesh position={[1, 1.2, 1]} scale={[0.5, 0.1, 0.5]} onClick={() => addPanel("OLLAMA", "Generate AI report")}>
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color="#a6e22e" />
      </mesh>

      {/* Render panels as floating text */}
      {panels.map((panel, index) => (
        <mesh key={panel.id} position={[0, 2 + index * 0.5, -0.5]}>
          <textGeometry args={[panel.output, { size: 0.15, height: 0.02 }]} />
          <meshStandardMaterial color={panel.engine === "GEMINI" ? "#fd971f" : "#a6e22e"} />
        </mesh>
      ))}
    </group>
  );
};

export default NexusCockpit3D;

