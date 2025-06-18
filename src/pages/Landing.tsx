import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, School, Sparkles, BookOpen, Brain, Trophy } from 'lucide-react';
import * as THREE from 'three';

// Extend Three.js elements for React Three Fiber
extend({ Mesh: THREE.Mesh, SphereGeometry: THREE.SphereGeometry, BoxGeometry: THREE.BoxGeometry, CylinderGeometry: THREE.CylinderGeometry });

// 3D Mascot Component
const AnimatedMascot = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { size, viewport, camera, gl } = useThree();
  // Track pointer position in normalized device coordinates
  const pointer = useRef({ x: 0, y: 0 });

  // Animate floating and head rotation
  useFrame((state) => {
    if (groupRef.current) {
      // Smoothly rotate head towards pointer
      const targetY = pointer.current.x * 0.6; // horizontal
      const targetX = pointer.current.y * 0.6; // vertical
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.08;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.08;
      // Floating
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  // Listen for pointer movement
  React.useEffect(() => {
    const handlePointerMove = (event: MouseEvent) => {
      // Convert to normalized device coordinates (-1 to 1)
      const x = (event.clientX / size.width) * 2 - 1;
      const y = -(event.clientY / size.height) * 2 + 1;
      pointer.current.x = x;
      pointer.current.y = y;
    };
    gl.domElement.addEventListener('pointermove', handlePointerMove);
    return () => {
      gl.domElement.removeEventListener('pointermove', handlePointerMove);
    };
  }, [size, gl]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Head */}
      <mesh ref={meshRef} position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#6366f1" wireframe={false} />
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

// Floating Icons Component
const FloatingIcons = () => {
  const iconPositions = useMemo(() => [
    [-4, 2, -2], [4, -1, -3], [-3, -2, -1], [3, 3, -4], [-5, 0, -2], [5, 1, -3]
  ], []);

  return (
    <>
      {iconPositions.map((position, index) => (
        <Float key={index} speed={1 + index * 0.2} rotationIntensity={0.5} floatIntensity={0.3}>
          <mesh position={position as [number, number, number]} scale={[0.3, 0.3, 0.3]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
              color={['#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'][index]} 
              transparent 
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
};

// 3D Scene Component
const Scene3D = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Stars radius={300} depth={60} count={1000} factor={7} saturation={0} fade />
        
        <AnimatedMascot />
        <FloatingIcons />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Generated Notes",
      description: "Transform any syllabus into comprehensive, personalized study notes"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Smart Flashcards",
      description: "Create interactive flashcards that adapt to your learning pace"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Gamified Learning",
      description: "Earn XP, unlock achievements, and compete with friends"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-siksha-purple via-indigo-600 to-siksha-pink relative overflow-hidden overflow-x-hidden">
      {/* Background 3D Scene */}
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-siksha-purple to-siksha-pink" />}>
        <Scene3D />
      </Suspense>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center bg-white/10 backdrop-blur-sm gap-2 sm:gap-0">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <div className="w-10 h-10 bg-siksha-yellow rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-siksha-purple" />
            </div>
            <span className="text-white font-bold text-lg sm:text-xl">Siksha AI</span>
          </div>
          <nav className="hidden md:flex space-x-6 text-white/90">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </nav>
        </header>

        {/* Main Hero Section */}
        <main className="flex-1 flex items-center justify-center px-2 sm:px-6">
          <div className="max-w-6xl mx-auto text-center">
            {/* Hero Title */}
            <div className="mb-8 sm:mb-12 animate-fade-in">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">
                Welcome to
                <span className="block bg-gradient-to-r from-siksha-yellow to-siksha-pink bg-clip-text text-transparent">
                  Siksha AI
                </span>
              </h1>
              <p className="text-base sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
                Revolutionizing Indian Education with AI-Powered Learning
                <br />
                <span className="text-siksha-yellow font-semibold">Learn Smarter • Study Better • Achieve More</span>
              </p>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-10 sm:mb-16 animate-fade-in delay-200">
              <Button
                size="lg"
                className="bg-white text-siksha-purple font-bold text-base sm:text-xl px-6 sm:px-12 py-4 sm:py-6 rounded-2xl shadow-xl hover:bg-siksha-yellow hover:text-siksha-purple transition-all duration-300 transform hover:scale-105 group"
                onClick={() => navigate('/auth')}
              >
                <GraduationCap className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                Continue as Student
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-siksha-purple/20 text-white font-bold text-base sm:text-xl px-6 sm:px-12 py-4 sm:py-6 rounded-2xl border-2 border-white/30 hover:bg-white hover:text-siksha-purple transition-all duration-300 transform hover:scale-105 group backdrop-blur-sm"
                onClick={() => navigate('/schools')}
              >
                <School className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                Continue as School/Teacher
              </Button>
            </div>

            {/* Features Grid */}
            <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-16 animate-fade-in delay-300">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 sm:p-8 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-siksha-yellow mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-white/70 bg-black/20 backdrop-blur-sm">
          <p>&copy; 2024 Siksha AI. Empowering the future of Indian education.</p>
        </footer>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-siksha-yellow/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-siksha-pink/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default Landing;
