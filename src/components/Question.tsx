import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Markdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { AlertTriangleIcon, InfoIcon, StarIcon } from "lucide-react";
import { FC, ReactNode } from "react";

// Example problem data - in a real app, this would be fetched from an API
const exampleProblem = {
  id: "1",
  title: "Two Sum",
  difficulty: "Easy",
  tags: ["Array", "Hash Table"],
  description: `
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

type InfoBoxProps = {
  type: "info" | "warning" | "tip";
  children: ReactNode;
};

// Custom InfoBox component for important notes
const InfoBox: FC<InfoBoxProps> = ({ type, children }) => {
  const icons = {
    info: <InfoIcon size={16} className="flex-shrink-0 text-blue-500" />,
    warning: (
      <AlertTriangleIcon size={16} className="flex-shrink-0 text-amber-500" />
    ),
    tip: <StarIcon size={16} className="flex-shrink-0 text-purple-500" />,
  };

  const colors = {
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300",
    warning:
      "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300",
    tip: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/40 dark:border-purple-900 dark:text-purple-300",
  };

  return (
    <div className={`my-4 p-3 border rounded-md flex gap-2 ${colors[type]}`}>
      {icons[type]}
      <div>{children}</div>
    </div>
  );
};

// Custom Example component for formatting problem examples
const Example: FC<{
  num: number;
  input: string;
  output: string;
  explanation?: string;
}> = ({ num, input, output, explanation }) => (
  <div className="my-4 p-3 border rounded-md bg-muted/20">
    <div className="font-medium mb-2 text-sm">Example {num}</div>
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      <div className="font-medium text-muted-foreground">Input:</div>
      <div className="font-mono">{input}</div>
      <div className="font-medium text-muted-foreground">Output:</div>
      <div className="font-mono">{output}</div>
      {explanation && (
        <>
          <div className="font-medium text-muted-foreground">Explanation:</div>
          <div>{explanation}</div>
        </>
      )}
    </div>
  </div>
);

export default function Question() {
  // Custom components for markdown rendering with proper TypeScript typing
  const markdownComponents: Components = {
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-medium mt-6 mb-3">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="my-4 leading-relaxed text-foreground/90">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="my-4 pl-6 list-disc space-y-2">{children}</ul>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed text-foreground/90">{children}</li>
    ),
    code: ({ children, ...props }) => {
      // const match = /language-(\w+)/.exec(className || "");

      // Handle code blocks (non-inline code)
      // if (!inline && match) {
      //   return (
      //     <div className="my-4 rounded-md overflow-hidden">
      //       <SyntaxHighlighter
      //         style={codeStyle}
      //         language={match[1]}
      //         PreTag="div"
      //         customStyle={{ margin: 0, borderRadius: 0 }}
      //         {...props}
      //       >
      //         {String(children).replace(/\n$/, "")}
      //       </SyntaxHighlighter>
      //     </div>
      //   );
      // }

      // Handle inline code
      return (
        <code
          className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm"
          {...props}
        >
          {children}
        </code>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic my-6 text-muted-foreground">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-600 hover:underline dark:text-blue-400"
      >
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-muted-foreground/20 bg-muted/50 px-4 py-2 text-left font-medium">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-muted-foreground/20 px-4 py-2">
        {children}
      </td>
    ),
  };

  // Process Markdown to replace example sections with custom components
  const renderProcessedMarkdown = () => {
    // Split the markdown by sections (identified by ## headings)
    const sections = exampleProblem.description.split(/(?=^## )/m);

    return sections.map((section, idx) => {
      // Check if this is an example section
      if (section.trim().startsWith("## Example")) {
        const match = section.match(/## Example (\d+):/);
        const exampleNum = match ? parseInt(match[1]) : idx;
        const example = exampleProblem.examples[exampleNum - 1];

        // If we have a matching example in our data, render our custom component
        if (example) {
          return (
            <Example
              key={`example-${exampleNum}`}
              num={exampleNum}
              input={example.input}
              output={example.output}
              explanation={example.explanation}
            />
          );
        }
      }

      // For regular sections, render as markdown
      return (
        <Markdown
          key={idx}
          components={markdownComponents}
          remarkPlugins={[remarkGfm]}
        >
          {section}
        </Markdown>
      );
    });
  };

  return (
    <div>
      <Card className="rounded-none h-full border-0">
        <CardHeader className="sticky top-0 z-10 bg-card border-b">
          <div className="flex mb-2 justify-between items-start">
            <div className="mb-4">
              <CardTitle>
                <h1 className="font-bold tracking-tighter text-2xl">
                  {exampleProblem.title}
                </h1>
              </CardTitle>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge
                  className={
                    exampleProblem.difficulty === "Easy"
                      ? "bg-green-500 hover:bg-green-600"
                      : exampleProblem.difficulty === "Medium"
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-red-500 hover:bg-red-600"
                  }
                >
                  {exampleProblem.difficulty}
                </Badge>

                {exampleProblem.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="font-normal text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="h-[calc(100vh-11rem)] ">
          <div className="text-sm px-2">
            {/* Problem statement section */}
            {renderProcessedMarkdown()}

            {/* Constraints section with visual styling */}
            <div className="mt-4 mb-4">
              <h2 className="text-xl font-semibold mb-4">Constraints</h2>
              <ul className="pl-6 list-disc space-y-2 text-muted-foreground">
                <li>
                  2 ≤ nums.length ≤ 10<sup>4</sup>
                </li>
                <li>
                  -10<sup>9</sup> ≤ nums[i] ≤ 10<sup>9</sup>
                </li>
                <li>
                  -10<sup>9</sup> ≤ target ≤ 10<sup>9</sup>
                </li>
                <li>Only one valid answer exists</li>
              </ul>
            </div>

            {/* Custom follow-up section */}
            <Separator className="my-6" />
            <div className="mt-6">
              <h3 className="font-medium text-base mb-3">Follow-up</h3>
              <InfoBox type="tip">
                Can you come up with an algorithm that is less than O(n²) time
                complexity?
              </InfoBox>
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}

// Lock icon for solution tab
const LockIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);
