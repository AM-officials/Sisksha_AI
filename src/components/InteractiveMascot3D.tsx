import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface InteractiveMascot3DProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const sizeMap = {
  sm: 0.8,
  md: 1.2,
  lg: 1.7,
};

// Error boundary specifically for the mascot component
interface MascotErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface MascotErrorBoundaryState {
  hasError: boolean;
}

class MascotErrorBoundary extends React.Component<MascotErrorBoundaryProps, MascotErrorBoundaryState> {
  constructor(props: MascotErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): MascotErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

const InteractiveMascot3D: React.FC<InteractiveMascot3DProps> = ({ size = 'md', onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { size: viewportSize, gl } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const scale = sizeMap[size] || 1.2;

  useFrame((state) => {
    try {
      if (groupRef.current) {
        const targetY = pointer.current.x * 0.6;
        const targetX = pointer.current.y * 0.6;
        groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.08;
        groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.08;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.18 * scale;
      }
    } catch (error) {
      console.error("Error in animation frame:", error);
    }
  });

  useEffect(() => {
    try {
      const handlePointerMove = (event: MouseEvent) => {
        const x = (event.clientX / viewportSize.width) * 2 - 1;
        const y = -(event.clientY / viewportSize.height) * 2 + 1;
        pointer.current.x = x;
        pointer.current.y = y;
      };
      
      if (gl && gl.domElement) {
        gl.domElement.addEventListener('pointermove', handlePointerMove);
        
        return () => {
          if (gl.domElement) {
            gl.domElement.removeEventListener('pointermove', handlePointerMove);
          }
        };
      }
    } catch (error) {
      console.error("Error setting up pointer movement:", error);
    }
    
    return () => {};
  }, [viewportSize, gl]);

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} onClick={onClick}>
      {/* Head */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.4, 0.3, 1.15]} scale={[0.13, 0.13, 0.13]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0.4, 0.3, 1.15]} scale={[0.13, 0.13, 0.13]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.4, 0.28, 1.23]} scale={[0.06, 0.06, 0.06]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.4, 0.28, 1.23]} scale={[0.06, 0.06, 0.06]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Mouth (arc/torus) */}
      <mesh position={[0, -0.25, 1.18]} rotation={[Math.PI / 2, 0, 0]} scale={[0.18, 0.18, 0.18]}>
        <torusGeometry args={[1, 0.18, 16, 100, Math.PI]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 1.5, 0]} scale={[0.1, 0.5, 0.1]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      {/* Antenna Ball */}
      <mesh position={[0, 2, 0]} scale={[0.2, 0.2, 0.2]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
    </group>
  );
};

// Wrap the mascot component with the error boundary
const SafeInteractiveMascot3D: React.FC<InteractiveMascot3DProps> = (props) => {
  const [canRender3D, setCanRender3D] = useState<boolean>(true);

  useEffect(() => {
    // Check if WebGL is supported
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setCanRender3D(false);
      }
    } catch (e) {
      setCanRender3D(false);
    }
  }, []);

  if (!canRender3D) {
    return null;
  }

  return (
    <MascotErrorBoundary fallback={null}>
      <InteractiveMascot3D {...props} />
    </MascotErrorBoundary>
  );
};

export default SafeInteractiveMascot3D; 