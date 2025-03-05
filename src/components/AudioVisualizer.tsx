"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Assuming you use shadcn's utils

interface AudioVisualizerProps {
  size?: number;
  maxGlow?: number;
  smoothingTimeConstant?: number;
  className?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  size = 120,
  maxGlow = 60,
  smoothingTimeConstant = 0.8,
  className,
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

  // Scale base circle size with amplitude but more subtly
  const circleSize = size + amplitude * 0.4;

  // Create distortion values for the shadows
  const distortionX = Math.sin(Date.now() / 400) * amplitude * 0.3;
  const distortionY = Math.cos(Date.now() / 300) * amplitude * 0.3;
  const distortionX2 = Math.sin(Date.now() / 350) * amplitude * 0.4;
  const distortionY2 = Math.cos(Date.now() / 250) * amplitude * 0.4;
  const distortionX3 = Math.sin(Date.now() / 450) * amplitude * 0.35;
  const distortionY3 = Math.cos(Date.now() / 350) * amplitude * 0.35;

  // Calculate shadow sizes based on amplitude
  const shadowSize1 = Math.min(amplitude * 1.2, maxGlow);
  const shadowSize2 = Math.min(amplitude * 1.3, maxGlow);
  const shadowSize3 = Math.min(amplitude * 1.1, maxGlow);

  // Instagram-like gradient shadow colors
  const instagramPink = "#E1306C";
  const instagramPurple = "#833AB4";
  const instagramOrange = "#F77737";
  const instagramYellow = "#FCAF45";

  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center min-h-[300px] w-full",
        className
      )}
    >
      <div className="relative h-[220px] w-[220px] flex items-center justify-center">
        {/* Multiple shadow elements that will distort with audio */}
        {isListening && amplitude > 3 && (
          <>
            {/* Instagram-like pink shadow */}
            <div
              className="absolute rounded-full opacity-70"
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                boxShadow: `0 0 ${shadowSize1}px ${
                  shadowSize1 / 2
                }px ${instagramPink}`,
                transform: `translate(${distortionX}px, ${distortionY}px)`,
                transition: "box-shadow 0.1s ease-out",
                zIndex: 1,
              }}
            />

            {/* Instagram-like purple shadow */}
            <div
              className="absolute rounded-full opacity-70"
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                boxShadow: `0 0 ${shadowSize2}px ${
                  shadowSize2 / 2
                }px ${instagramPurple}`,
                transform: `translate(${distortionX2}px, ${distortionY2}px)`,
                transition: "box-shadow 0.1s ease-out",
                zIndex: 1,
              }}
            />

            {/* Instagram-like yellow-orange shadow */}
            <div
              className="absolute rounded-full opacity-70"
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                boxShadow: `0 0 ${shadowSize3}px ${shadowSize3 / 2}px ${
                  amplitude > 15 ? instagramOrange : instagramYellow
                }`,
                transform: `translate(${distortionX3}px, ${distortionY3}px)`,
                transition: "box-shadow 0.1s ease-out",
                zIndex: 1,
              }}
            />
          </>
        )}

        {/* Main circle - adapts to light/dark theme */}
        <div
          className="absolute rounded-full bg-background border border-border z-10 transition-all duration-100 ease-out shadow-sm"
          style={{
            width: `${circleSize}px`,
            height: `${circleSize}px`,
          }}
        />
      </div>

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
