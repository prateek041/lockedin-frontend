"use client";

import { useState } from "react";
import ThreeAudioVisualizer from "@/components/ThreeAudioVisualizer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AudioVisualizerPage() {
  const [status, setStatus] = useState("");
  const [recordings, setRecordings] = useState<
    Array<{ url: string; timestamp: Date }>
  >([]);

  const handleStart = () => {
    setStatus("Listening to your voice...");
  };

  const handleStop = (audioBlob?: Blob) => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setRecordings((prev) => [...prev, { url, timestamp: new Date() }]);
      setStatus("Recording saved.");
    } else {
      setStatus("Voice detection stopped");
    }

    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <div className="container mx-auto py-12 max-w-4xl">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Audio Visualizer</h1>
        <p className="text-muted-foreground text-center max-w-lg">
          Three.js-powered audio visualization that responds to your voice and
          creates an interactive, dynamic 3D experience.
        </p>
      </div>

      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
          <TabsTrigger value="demo">Demo</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="demo">
          <div className="flex flex-col items-center">
            <Card className="w-full mb-4">
              <CardHeader>
                <CardTitle>Voice-Responsive 3D Visualization</CardTitle>
                <CardDescription>
                  Speak into your microphone to see how the 3D visualization
                  reacts to your voice. Click the microphone button to
                  start/stop.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <ThreeAudioVisualizer
                  size="lg"
                  onStart={handleStart}
                  onStop={handleStop}
                  saveRecording={true}
                />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Badge
                  variant="outline"
                  className={status ? "opacity-100" : "opacity-0"}
                >
                  {status || "Status"}
                </Badge>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recordings">
          <Card>
            <CardHeader>
              <CardTitle>Your Recordings</CardTitle>
              <CardDescription>
                Voice recordings saved from your visualization sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recordings.length > 0 ? (
                recordings.map((recording, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Recording {index + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {recording.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <audio src={recording.url} controls className="h-8" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recordings yet. Start the visualizer and speak to create
                  recordings.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Small Visualizer</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <ThreeAudioVisualizer size="sm" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medium Visualizer</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <ThreeAudioVisualizer size="md" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
