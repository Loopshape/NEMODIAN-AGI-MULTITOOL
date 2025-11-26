import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import NexusCockpit3D from './NexusCockpit3D'; // Now in components directory

const MultiToolUI: React.FC = () => {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <NexusCockpit3D /> {/* No longer needs prompt prop here */}
      <OrbitControls />
    </Canvas>
  );
};

export default MultiToolUI;


