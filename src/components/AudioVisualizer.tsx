"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils"; // Assuming you use shadcn's utils

/*
 * AudioVisualizerProps are the props for that set the default behaviour of the
 * AudioVisualizer React component.
*/

interface AudioVisualizerProps {
  size?: number; // base size of the circle.
  maxGlow?: number; // maximum size of the glow effect.
  smoothingTimeConstant?: number; // how smoothly is the audio data processed.
  className?: string; // custom CSS styling.
}

/**
 * AudioVisualizer is a React component that:
 * - Captures audio from microphone using Web Audio API.
 * - Analyzes the sound to measure its loudness(amplitude).
 * - Visualizes it with a circle that grows and glows based on how loud the sound is.
 * - Toggles on/off with a button.
*/

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  size = 120,
  maxGlow = 60,
  smoothingTimeConstant = 0.8,
  className,
}) => {
  const [amplitude, setAmplitude] = useState(0);
  // Add a smoothed amplitude state for gradual transitions
  const [smoothedAmplitude, setSmoothedAmplitude] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const smoothAnimationIdRef = useRef<number | null>(null); // New ref for the smoothing animation
  const streamRef = useRef<MediaStream | null>(null);

  // Keep track of last non-zero amplitude for fade out effect
  const lastAmplitudeRef = useRef(0);

  // Function to start audio capture
  const startAudio = async () => {
    if (isListening) return; // Prevent duplicate starts

    try {
      // const stream = await navigator.mediaDevices.getUserMedia()
      // Get User Microphone access.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);

      // create an AnalyserNode to extract data from the audio stream.
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
    // Instead of immediately setting amplitude to 0, we'll let it fade out naturally
    // through our smoothing effect

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

    // Set raw amplitude to 0, but let the smoothed one fade out gradually
    setAmplitude(0);
    setIsListening(false);
    // Don't cancel the smooth animation here - we want it to fade out naturally
  };

  useEffect(() => {
    // No auto-start. The user will click play to start.

    // Cleanup on unmount
    return () => {
      stopAudio();
      if (smoothAnimationIdRef.current) {
        cancelAnimationFrame(smoothAnimationIdRef.current);
        smoothAnimationIdRef.current = null;
      }
    };
  }, []);

  // Fix the smoothing animation to avoid infinite loop
  useEffect(() => {
    // Clean up previous animation frame if exists
    if (smoothAnimationIdRef.current) {
      cancelAnimationFrame(smoothAnimationIdRef.current);
    }

    // When isListening goes false, we want a slower fade-out
    const smoothingFactor = isListening ? 0.15 : 0.05;

    // Save last significant amplitude for smoother transitions
    if (amplitude > 5) {
      lastAmplitudeRef.current = amplitude;
    }

    // Create recursive function for smooth animation
    const smoothAnimation = () => {
      // Calculate the new smoothed value with an easing function
      const diff = amplitude - smoothedAmplitude;
      const newSmoothedValue = smoothedAmplitude + diff * smoothingFactor;

      setSmoothedAmplitude(newSmoothedValue);

      // Continue animation only while there's a significant difference
      // or we're in fade-out (not listening but still have amplitude)
      if (Math.abs(diff) > 0.1 || (!isListening && smoothedAmplitude > 0.1)) {
        smoothAnimationIdRef.current = requestAnimationFrame(smoothAnimation);
      }
    };

    // Start the animation
    smoothAnimationIdRef.current = requestAnimationFrame(smoothAnimation);

    // Clean up on unmount or when dependencies change
    return () => {
      if (smoothAnimationIdRef.current) {
        cancelAnimationFrame(smoothAnimationIdRef.current);
        smoothAnimationIdRef.current = null;
      }
    };
  }, [amplitude, isListening]); // Remove smoothedAmplitude from dependencies to avoid infinite loop

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

      // run animate recursively 60 times per second.
      animationIdRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  // Scale base circle size with smoothedAmplitude instead of raw amplitude
  const circleSize = size + smoothedAmplitude * 0.4;

  // Create distortion values for the shadows with smoothedAmplitude
  const distortionX = Math.sin(Date.now() / 400) * smoothedAmplitude * 1;
  const distortionY = Math.cos(Date.now() / 300) * smoothedAmplitude * 1;
  const distortionX2 = Math.sin(Date.now() / 350) * smoothedAmplitude * 1;
  const distortionY2 = Math.cos(Date.now() / 250) * smoothedAmplitude * 1;
  const distortionX3 = Math.sin(Date.now() / 450) * smoothedAmplitude * 1;
  const distortionY3 = Math.cos(Date.now() / 350) * smoothedAmplitude * 1;

  // Calculate shadow sizes based on smoothedAmplitude
  const shadowSize1 = Math.min(smoothedAmplitude * 1.5, maxGlow);
  const shadowSize2 = Math.min(smoothedAmplitude * 1.6, maxGlow);
  const shadowSize3 = Math.min(smoothedAmplitude * 1.4, maxGlow);

  // Instagram-like gradient shadow colors
  const instagramPink = "#E1306C";
  const instagramPurple = "#833AB4";
  const instagramOrange = "#F77737";
  const instagramYellow = "#FCAF45";

  // Calculate opacity based on amplitude for smooth appearance/disappearance
  const shadowOpacity = Math.min(
    0.7,
    Math.max(0, (smoothedAmplitude - 1.5) / 10)
  );

  return (
    <div
      className={cn(
        "flex py-2 flex-col h-full justify-center items-center w-full",
        className
      )}
    >
      <div className="mt-10">
        {!isListening ? (
          <div
            onClick={startAudio}
            // variant="outline"
            className="transition-all duration-200 hover:bg-muted"
          >
            <h1 className="text-xl">
              Start Listening
            </h1>
          </div>
        ) : (
          <div
            onClick={stopAudio}
            // variant="outline"
            className="transition-all duration-200 hover:bg-muted"
          >
            <h1 className="text-xl">
              Stop Listening
            </h1>
          </div>
        )}
      </div>
      <div className="relative h-full w-[220px] flex items-center justify-center ">
        {/* Multiple shadow elements with smoothed transitions */}
        {/* Show shadows even when not listening for fade-out effect */}
        {(smoothedAmplitude > 0.5 || isListening) && (
          <>
            {/* Instagram-like pink shadow */}
            <div
              className={`absolute rounded-full h-full`}
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                boxShadow: `0 0 ${shadowSize1}px ${shadowSize1 / 2
                  }px ${instagramPink}`,
                transform: `translate(${distortionX}px, ${distortionY}px)`,
                opacity: shadowOpacity,
                transition:
                  "opacity 0.6s ease-out, box-shadow 0.4s ease-out, transform 0.3s ease-out",
                zIndex: 1,
              }}
            />

            {/* Instagram-like purple shadow */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                boxShadow: `0 0 ${shadowSize2}px ${shadowSize2 / 2
                  }px ${instagramPurple}`,
                transform: `translate(${distortionX2}px, ${distortionY2}px)`,
                opacity: shadowOpacity,
                transition:
                  "opacity 0.6s ease-out, box-shadow 0.4s ease-out, transform 0.3s ease-out",
                zIndex: 1,
              }}
            />

            {/* Instagram-like yellow-orange shadow */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                boxShadow: `0 0 ${shadowSize3}px ${shadowSize3 / 2}px ${smoothedAmplitude > 15 ? instagramOrange : instagramYellow
                  }`,
                transform: `translate(${distortionX3}px, ${distortionY3}px)`,
                opacity: shadowOpacity,
                transition:
                  "opacity 0.6s ease-out, box-shadow 0.4s ease-out, transform 0.3s ease-out",
                zIndex: 1,
              }}
            />
          </>
        )}

        {/* Main circle - adapts to light/dark theme with smoother transitions */}
        <div
          className="absolute rounded-full bg-foreground border border-border z-10 shadow-sm"
          style={{
            width: `${circleSize}px`,
            height: `${circleSize}px`,
            transition: "width 0.3s ease-out, height 0.3s ease-out",
          }}
        />
      </div>




    </div>
  );
};

export default AudioVisualizer;
