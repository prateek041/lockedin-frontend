"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeEditor from "./CodeEditor";
import TestCase from "./TestCase";
import { useState } from "react";

// Example problem data - in a real app, this would be fetched from an API
const exampleProblem = {
  id: "1",
  title: "Two Sum",
  difficulty: "Easy",
  description: `
## Problem Statement

Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

## Example 1:

**Input:** nums = [2,7,11,15], target = 9
**Output:** [0,1]
**Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].

## Example 2:

**Input:** nums = [3,2,4], target = 6
**Output:** [1,2]

## Example 3:

**Input:** nums = [3,3], target = 6
**Output:** [0,1]

## Constraints:

- 2 <= nums.length <= 104
- -109 <= nums[i] <= 109
- -109 <= target <= 109
- **Only one valid answer exists.**

## Follow-up:
Can you come up with an algorithm that is less than O(n²) time complexity?
  `,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "",
    },
  ],
  hints: [
    "A really brute force way would be to search for all possible pairs of numbers but that would be too slow.",
    "Try to use the fact that the solution set must not contain duplicate pairs.",
  ],
};

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
        <Card className="rounded-none h-full border-0">
          <CardHeader className="px-6 py-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{exampleProblem.title}</CardTitle>
                <CardDescription>
                  <span
                    className={
                      exampleProblem.difficulty === "Easy"
                        ? "text-green-500"
                        : exampleProblem.difficulty === "Medium"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }
                  >
                    {exampleProblem.difficulty}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <ScrollArea className="h-[calc(100%-4rem)]">
            <Tabs defaultValue="description" className="px-6 py-4">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="hints">Hints</TabsTrigger>
                <TabsTrigger value="solution">Solution</TabsTrigger>
              </TabsList>
              <TabsContent
                value="description"
                className="prose prose-sm dark:prose-invert mt-4"
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: exampleProblem.description,
                  }}
                />
              </TabsContent>
              <TabsContent value="hints">
                <ul className="list-disc pl-5 mt-4 space-y-2">
                  {exampleProblem.hints.map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="solution">
                <p className="text-sm text-muted-foreground mt-4">
                  Solution will be available after you submit your answer.
                </p>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </Card>
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
