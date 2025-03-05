"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface AudioVisualizerProps {
  // Optionally pass props if needed (e.g., color, size, or audio constraints)
  size?: number; // Base size of the circle
  neonColor?: string; // Neon glow color
  maxGlow?: number; // Maximum glow size
  smoothingTimeConstant?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  size = 100,
  neonColor = "#00FFFF",
  maxGlow = 50,
  smoothingTimeConstant = 0.8,
}) => {
  const [amplitude, setAmplitude] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Function to start audio capture
  const startAudio = async () => {
    if (isListening) return; // Prevent duplicate starts

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048; // Larger fftSize -> more data points
      analyser.smoothingTimeConstant = smoothingTimeConstant;

      source.connect(analyser);

      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      startAnimation();
      setIsListening(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  // Function to stop audio capture
  const stopAudio = () => {
    if (!isListening) return;

    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    dataArrayRef.current = null;
    setAmplitude(0);
    setIsListening(false);
  };

  useEffect(() => {
    // No auto-start. The user will click play to start.

    // Cleanup on unmount
    return () => {
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animation loop to read the analyser data and update amplitude
  const startAnimation = () => {
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (!analyser || !dataArray) return;

    const animate = () => {
      analyser.getByteTimeDomainData(dataArray);

      // Calculate a very rough amplitude
      // We can simply measure how "far" from 128 (the midpoint in time-domain data) the wave is
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const value = dataArray[i] - 128; // center around 0
        sum += Math.abs(value);
      }
      const avg = sum / dataArray.length; // average deviation
      setAmplitude(avg);

      animationIdRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  // The circle's size and glow scale with amplitude
  // You can tweak the multipliers to get the desired bounce effect
  const circleSize = size + amplitude;
  const glowSize = Math.min(amplitude, maxGlow);

  return (
    <div className="flex flex-col justify-center items-center min-h-[300px] w-full">
      {/* Visualizer circle with dynamic styling */}
      <div
        className="rounded-full bg-black transition-all duration-100 ease-in-out"
        style={{
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          boxShadow: `0 0 ${glowSize}px ${neonColor}`,
        }}
      />

      <div className="mt-6">
        {!isListening ? (
          <Button
            onClick={startAudio}
            variant="outline"
            className="transition-all duration-200 hover:bg-muted"
          >
            Start Listening
          </Button>
        ) : (
          <Button
            onClick={stopAudio}
            variant="outline"
            className="transition-all duration-200 hover:bg-muted"
          >
            Stop Listening
          </Button>
        )}
      </div>
    </div>
  );
};

export default AudioVisualizer;
