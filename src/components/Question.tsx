import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function Question() {
  return (
    <div>
      <Card className="rounded-none h-full border-0">
        <CardHeader className="border-b">
          <div className="flex mb-2 justify-between items-start">
            <div>
              <CardTitle>
                <h1 className="font-bold tracking-tighter text-2xl">
                  {exampleProblem.title}
                </h1>
              </CardTitle>
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
          <Tabs defaultValue="description" className="px-2">
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
    </div>
  )
}
