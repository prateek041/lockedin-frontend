"use client";

import {
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import AudioVisualizer from "./AudioVisualizer";
import { Separator } from "./ui/separator";

interface TestCaseProps {
  language: string;
  runTestCase: (input: string) => Promise<{
    success: boolean;
    output: string;
    expectedOutput?: string;
    executionTime?: number;
  }>;
}

export default function TestCase({ language, runTestCase }: TestCaseProps) {

  return (
    <div className="w-full h-full flex flex-col rounded-none">
      <CardHeader className="border-b">
      </CardHeader>

      <CardContent className="p-0 flex h-full">
        <div className="w-1/2 flex items-center justify-center ">
          <h1>
            Test Case Section
          </h1>
        </div>
        <Separator orientation="vertical" />
        <div className="w-1/2 h-full">
          <AudioVisualizer />
        </div>
      </CardContent>
    </div>
  );
}
