"use client";

import AudioVisualizer from "@/components/AudioVisualizer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

export default function VoiceDemoPage() {
  const [status, setStatus] = useState("");

  const handleStart = () => {
    setStatus("Listening to your voice...");
  };

  const handleStop = () => {
    setStatus("Voice detection stopped");
    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <div className="container bg-red-50 mx-auto py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2 text-center">Voice Visualizer</h1>
      <p className="text-muted-foreground text-center mb-8">
        A simple, elegant audio visualizer with neon glow effect
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Audio Visualization Demo</CardTitle>
          <CardDescription>
            Speak into your microphone to see the visualization react to your
            voice
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8 space-y-6">
          <AudioVisualizer />

          <p className="h-6 text-sm text-muted-foreground">{status}</p>
        </CardContent>
      </Card>
    </div>
  );
}
