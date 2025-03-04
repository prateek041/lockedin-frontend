"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  PlayIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState("case-1");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    output?: string;
    expectedOutput?: string;
    executionTime?: number;
  }>({});

  // Initialize with one test case
  const [testCases, setTestCases] = useState([
    {
      id: "case-1",
      title: "Case 1",
      input: "",
      expectedOutput: "",
    },
  ]);

  // Function to add a new test case
  const addTestCase = () => {
    const newId = `case-${testCases.length + 1}`;
    setTestCases([
      ...testCases,
      {
        id: newId,
        title: `Case ${testCases.length + 1}`,
        input: "",
        expectedOutput: "",
      },
    ]);
    setActiveTab(newId);
  };

  // Update test case input
  const updateInput = (id: string, input: string) => {
    setTestCases(
      testCases.map((testCase) =>
        testCase.id === id ? { ...testCase, input } : testCase
      )
    );
  };

  // Update expected output
  const updateExpectedOutput = (id: string, expectedOutput: string) => {
    setTestCases(
      testCases.map((testCase) =>
        testCase.id === id ? { ...testCase, expectedOutput } : testCase
      )
    );
  };

  // Run the current test case
  const handleRunTest = async () => {
    const currentCase = testCases.find((tc) => tc.id === activeTab);
    if (!currentCase) return;

    setIsRunning(true);
    setResult({}); // Clear previous results

    try {
      const result = await runTestCase(currentCase.input);
      setResult({
        success: result.success,
        output: result.output,
        expectedOutput: currentCase.expectedOutput || result.expectedOutput,
        executionTime: result.executionTime,
      });
    } catch (error) {
      setResult({
        success: false,
        output: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const activeTestCase =
    testCases.find((tc) => tc.id === activeTab) || testCases[0];

  return (
    <Card className="w-full h-full flex flex-col border rounded-none">
      <CardHeader className="p-2 border-b bg-muted/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Test Cases</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 px-2"
            onClick={addTestCase}
          >
            + Add Case
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-grow">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full h-full flex flex-col"
        >
          <TabsList className="h-7 px-1 bg-transparent border-b rounded-none gap-1">
            {testCases.map((testCase) => (
              <TabsTrigger
                key={testCase.id}
                value={testCase.id}
                className="text-xs h-6 data-[state=active]:bg-muted"
              >
                {testCase.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {testCases.map((testCase) => (
            <TabsContent
              key={testCase.id}
              value={testCase.id}
              className="flex-grow flex flex-col h-full mt-0 data-[state=active]:flex-1 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-1 p-2 h-full">
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1 text-muted-foreground">
                    Input:
                  </label>
                  <Textarea
                    placeholder="Enter your test case input"
                    className="flex-grow text-xs font-mono resize-none h-full"
                    value={testCase.input}
                    onChange={(e) => updateInput(testCase.id, e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1 text-muted-foreground">
                    Expected Output:
                  </label>
                  <Textarea
                    placeholder="Enter expected output"
                    className="flex-grow text-xs font-mono resize-none h-full"
                    value={testCase.expectedOutput}
                    onChange={(e) =>
                      updateExpectedOutput(testCase.id, e.target.value)
                    }
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <CardFooter className="p-2 border-t flex-col items-start">
        <div className="flex justify-between items-center w-full">
          <Button
            size="sm"
            onClick={handleRunTest}
            disabled={isRunning}
            className="h-7 text-xs flex items-center gap-1"
          >
            <PlayIcon className="h-3 w-3" />
            Run Test
          </Button>

          {result.executionTime !== undefined && (
            <span className="text-xs text-muted-foreground">
              Execution Time: {result.executionTime}ms
            </span>
          )}
        </div>

        {result.success !== undefined && (
          <div className="mt-2 w-full">
            <div
              className={cn(
                "flex items-center gap-1 mb-1 text-xs font-medium",
                result.success ? "text-green-500" : "text-red-500"
              )}
            >
              {result.success ? (
                <CheckCircledIcon className="h-3 w-3" />
              ) : (
                <CrossCircledIcon className="h-3 w-3" />
              )}
              {result.success ? "Passed" : "Failed"}
            </div>

            <ScrollArea className="h-20 w-full border rounded-sm bg-muted/30">
              <div className="p-2">
                <div className="text-xs font-medium mb-1">Output:</div>
                <pre className="text-xs whitespace-pre-wrap font-mono">
                  {result.output}
                </pre>

                {!result.success && result.expectedOutput && (
                  <>
                    <div className="text-xs font-medium mb-1 mt-2">
                      Expected:
                    </div>
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {result.expectedOutput}
                    </pre>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
