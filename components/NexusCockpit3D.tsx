import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

const NexusCockpit3D: React.FC = () => {
  const cockpitRef = useRef<THREE.Group>(null);
  const buttonRef = useRef<Mesh>(null);

  // Rotate cockpit
  useFrame((state, delta) => {
    if (cockpitRef.current) cockpitRef.current.rotation.y += delta * 0.2;
  });

  // Example 3D button click
  const handleButtonClick = () => {
    alert("3D button clicked!");
  };

  return (
    <group ref={cockpitRef}>
      {/* Cockpit base */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[3, 0.5, 2]} />
        <meshStandardMaterial color="#f92672" />
      </mesh>

      {/* Cylinder part */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
        <meshStandardMaterial color="#66d9ef" />
      </mesh>

      {/* Interactive button in 3D */}
      <mesh
        ref={buttonRef}
        position={[0, 1.2, 1]}
        onClick={handleButtonClick}
        scale={[0.5, 0.1, 0.5]}
      >
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color="#a6e22e" />
      </mesh>
    </group>
  );
};

export default NexusCockpit3D;

