"use client";

import { useRef, useState, useEffect, FC } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, OrbitControls } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlayIcon, StopIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import * as THREE from "three";
import { useTheme } from "next-themes";

interface AudioVisualizerProps {
  className?: string;
  onStart?: () => void;
  onStop?: (audioBlob?: Blob) => void;
  size?: "sm" | "md" | "lg";
  saveRecording?: boolean;
}

interface AudioMeshProps {
  audioLevel: number;
  isActive: boolean;
}

// The reactive sphere that visualizes the audio
const AudioMesh: FC<AudioMeshProps> = ({ audioLevel, isActive }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  // ShadCN UI neutral theme colors
  const getThemeColors = () => {
    // Light theme uses slate-600 for active, slate-400 for idle
    // Dark theme uses slate-400 for active, slate-700 for idle
    if (theme === "dark") {
      return {
        active: new THREE.Color("#94a3b8"), // slate-400
        idle: new THREE.Color("#334155"), // slate-700
      };
    } else {
      return {
        active: new THREE.Color("#475569"), // slate-600
        idle: new THREE.Color("#94a3b8"), // slate-400
      };
    }
  };

  const colors = getThemeColors();

  // Adjust distortion based on audio level
  useFrame(() => {
    if (!meshRef.current) return;

    // Set color based on activity
    if (isActive) {
      meshRef.current.material.color.lerp(colors.active, 0.05);
    } else {
      meshRef.current.material.color.lerp(colors.idle, 0.05);
    }

    // Modify distortion based on audio level (with smoothing)
    const currentDistort = (meshRef.current.material as any).distort || 0;
    const targetDistort = 0.2 + audioLevel * 0.4; // More subtle distortion
    const newDistort = currentDistort + (targetDistort - currentDistort) * 0.1;
    (meshRef.current.material as any).distort = newDistort;

    // Pulse the sphere slightly
    const scale = 1 + audioLevel * 0.15; // More subtle scale change
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color={isActive ? colors.active : colors.idle}
        attach="material"
        distort={0.2}
        speed={1.5}
        roughness={0.5}
        metalness={0.2}
      />
    </Sphere>
  );
};

// Camera controller with more subtle movements
const CameraController = ({ audioLevel }: { audioLevel: number }) => {
  const { camera } = useThree();

  useFrame(() => {
    if (audioLevel > 0.05) {
      const intensity = audioLevel * 0.03; // More subtle movement
      const time = Date.now() * 0.0005; // Slower movement

      // Subtle camera movement based on audio level
      camera.position.x = Math.sin(time * 0.5) * intensity;
      camera.position.y = Math.cos(time * 0.3) * intensity;
    }

    camera.lookAt(0, 0, 0);
  });

  return null;
};

// Background particles that react to audio
const ParticleField = ({
  audioLevel,
  isActive,
}: {
  audioLevel: number;
  isActive: boolean;
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  const { theme } = useTheme();

  const particleCount = 80; // Fewer particles for a cleaner look
  const positions = new Float32Array(particleCount * 3);

  // Get neutral theme colors for particles
  const getThemeParticleColor = () => {
    return theme === "dark" ? "#64748b" : "#475569"; // slate-500 or slate-600
  };

  // Create initial random positions
  useEffect(() => {
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 5;
      positions[i3 + 1] = (Math.random() - 0.5) * 5;
      positions[i3 + 2] = (Math.random() - 0.5) * 5;
    }
  }, [positions]);

  // Animate particles
  useFrame(() => {
    if (!particlesRef.current) return;

    const time = Date.now() * 0.0003; // Slower movement
    const geometry = particlesRef.current.geometry as THREE.BufferGeometry;
    const positionAttribute = geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;

    // Update particle positions
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const x = positionAttribute.array[i3];
      const y = positionAttribute.array[i3 + 1];
      const z = positionAttribute.array[i3 + 2];

      // Apply audio-reactive movement
      const factor = 0.05 + audioLevel * 0.2; // More subtle movement
      const distance = Math.sqrt(x * x + y * y + z * z);

      // Move particles in a spherical pattern
      positionAttribute.array[i3] = x + Math.sin(time + distance) * factor;
      positionAttribute.array[i3 + 1] = y + Math.cos(time + distance) * factor;
      positionAttribute.array[i3 + 2] =
        z + Math.sin(time + distance * 0.5) * factor;
    }

    positionAttribute.needsUpdate = true;

    // Fade opacity based on activity
    const material = particlesRef.current.material as THREE.PointsMaterial;
    const targetOpacity = isActive ? 0.4 : 0.1; // More subtle opacity
    material.opacity += (targetOpacity - material.opacity) * 0.05;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={particleCount}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04} // Smaller particles
        transparent
        opacity={0.2}
        color={getThemeParticleColor()}
        blending={THREE.AdditiveBlending}
        depthWrite={false} // Prevents particles from being occluded by each other
      />
    </points>
  );
};

export default function ThreeAudioVisualizer({
  className,
  onStart,
  onStop,
  size = "md",
  saveRecording = false,
}: AudioVisualizerProps) {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // ...existing refs...
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Size classes for different container sizes
  const containerSizes = {
    sm: "h-36 w-36",
    md: "h-60 w-60",
    lg: "h-80 w-80",
  };

  // ... existing startListening, stopListening, updateAudioLevel functions ...

  // Get the background color based on theme
  const { theme } = useTheme();
  const getBackgroundColor = () => {
    return theme === "dark"
      ? "#1e293b" // slate-800 for dark theme
      : "#f8fafc"; // slate-50 for light theme
  };

  // Get button colors based on active state and theme
  const getButtonClasses = () => {
    const baseClasses = "h-8 w-8 rounded-full border shadow-sm";

    if (isListening) {
      return cn(
        baseClasses,
        "bg-muted-foreground text-muted hover:bg-muted-foreground/90"
      );
    }

    return cn(baseClasses, "bg-background text-foreground hover:bg-muted/50");
  };

  // Setup and start audio processing
  const startListening = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 1024;
      analyserRef.current.smoothingTimeConstant = 0.8;

      const source = audioContextRef.current.createMediaStreamSource(
        streamRef.current
      );
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      // Setup recording if needed
      if (saveRecording) {
        audioChunksRef.current = [];
        mediaRecorderRef.current = new MediaRecorder(streamRef.current);

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.start();
      }

      setIsListening(true);
      updateAudioLevel();
      if (onStart) onStart();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Stop audio processing and clean up
  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Create audio blob if saving recordings
    let audioBlob: Blob | undefined = undefined;
    if (saveRecording && audioChunksRef.current.length > 0) {
      audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    }

    // Stop and clean up audio streams and context
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    setIsListening(false);
    setAudioLevel(0);
    if (onStop) onStop(audioBlob);
  };

  // Update audio level from microphone input
  const updateAudioLevel = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    // Calculate average volume from frequency data
    let sum = 0;
    const lowerBound = 5; // Skip the lowest frequencies (reduce noise)
    const upperBound = Math.min(100, dataArrayRef.current.length); // Focus on speech frequencies

    for (let i = lowerBound; i < upperBound; i++) {
      sum += dataArrayRef.current[i];
    }

    // Calculate and normalize the level
    const avg = sum / (upperBound - lowerBound);
    const normalizedLevel = Math.min(1, avg / 128);

    // Apply smoothing for organic movement
    setAudioLevel((prev) => prev * 0.7 + normalizedLevel * 0.3);

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  // Toggle audio listening state
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border shadow-sm",
        className,
        containerSizes[size]
      )}
    >
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 3.5], fov: 45 }}>
        <color attach="background" args={[getBackgroundColor()]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.4} castShadow />
        <AudioMesh audioLevel={audioLevel} isActive={isListening} />
        <ParticleField audioLevel={audioLevel} isActive={isListening} />
        <CameraController audioLevel={audioLevel} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4 + audioLevel * 1.5} // Slower base rotation
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* Controls overlay - bottom center for better aesthetics */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className={getButtonClasses()}
                onClick={toggleListening}
              >
                {isListening ? (
                  <StopIcon className="h-3.5 w-3.5" />
                ) : (
                  <PlayIcon className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isListening ? "Stop recording" : "Start recording"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
}
