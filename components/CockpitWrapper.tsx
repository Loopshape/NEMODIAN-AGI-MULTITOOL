import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import NexusCockpit3D from "./NexusCockpit3D";

const CockpitWrapper: React.FC = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "#272822" }}>
      {/* Monokai-style UI overlay */}
      <div
        className="ui-panel"
        style={{
          position: "absolute",
          zIndex: 10,
          padding: 15,
          color: "#f8f8f2",
          fontFamily: "Monaco, monospace",
          fontSize: 14,
        }}
      >
        <button
          style={{
            backgroundColor: "#66d9ef",
            border: "none",
            padding: "6px 12px",
            marginBottom: 8,
            cursor: "pointer",
            fontWeight: "bold",
            color: "#272822",
          }}
        >
          Launch
        </button>
        <div>MultiTool 2244-1</div>
      </div>

      {/* 3D cockpit */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

        <NexusCockpit3D />
      </Canvas>
    </div>
  );
};

export default CockpitWrapper;

