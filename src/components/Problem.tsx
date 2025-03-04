"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import CodeEditor from "./CodeEditor";
import TestCase from "./TestCase";
import { useState } from "react";
import Question from "./Question";

export function ProblemWrapper() {
  const [code, setCode] = useState<string>("// Write your solution here\n\n");
  const [language, setLanguage] = useState<string>("javascript");

  // This would connect to your backend in a real application
  const runTestCase = async (
    input: string
  ): Promise<{
    success: boolean;
    output: string;
    expectedOutput?: string;
    executionTime?: number;
  }> => {
    // Mock implementation
    return new Promise((resolve) => {
      console.log("Running test with:", { code, language, input });

      setTimeout(() => {
        // Simulate a test run
        const success = Math.random() > 0.3; // 70% chance of success for demo
        const executionTime = Math.floor(Math.random() * 100) + 5;

        resolve({
          success,
          output: success ? "[0, 1]" : "[1, 0]", // Just for demo
          executionTime,
          expectedOutput: success ? undefined : "[0, 1]",
        });
      }, 800);
    });
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleRunCode = () => {
    console.log("Running code:", { code, language });
    // You'd run the code here
  };

  const handleSubmitCode = () => {
    console.log("Submitting solution:", { code, language });
    // You'd submit the solution here
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-screen max-h-screen"
    >
      {/* Problem Description Panel */}
      <ResizablePanel defaultSize={40} minSize={25}>
        <Question />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Code Editor and Test Cases Panel */}
      <ResizablePanel defaultSize={60} minSize={30}>
        <ResizablePanelGroup direction="vertical">
          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="h-full">
              <CodeEditor
                initialCode={code}
                onCodeChange={handleCodeChange}
                initialLanguage={language}
                onLanguageChange={handleLanguageChange}
                onRun={handleRunCode}
                onSubmit={handleSubmitCode}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Test Cases Panel */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full">
              <TestCase language={language} runTestCase={runTestCase} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
