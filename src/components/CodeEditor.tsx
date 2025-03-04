"use client";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-java";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlayIcon,
  PaperPlaneIcon,
  ResetIcon,
  TimerIcon,
  PauseIcon,
} from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "Javascript" },
  { value: "python", label: "Python" },
  { value: "golang", label: "Go" },
  { value: "java", label: "Java" },
];

const Timer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  // Format time to display as MM:SS
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Toggle timer visibility and start/stop
  const toggleTimer = () => {
    if (!isVisible) {
      setIsVisible(true);
      startTimer();
    } else {
      isRunning ? pauseTimer() : startTimer();
    }
  };

  // Start the timer
  const startTimer = () => {
    setIsRunning(true);
    const id = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
    setTimerId(id);
  };

  // Pause the timer
  const pauseTimer = () => {
    if (timerId) {
      clearInterval(timerId);
      setIsRunning(false);
    }
  };

  // Reset the timer
  const resetTimer = () => {
    pauseTimer();
    setTime(0);
  };

  // Hide the timer and reset
  const hideTimer = () => {
    pauseTimer();
    setTime(0);
    setIsVisible(false);
  };

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [timerId]);

  return (
    <div className="flex items-center gap-1">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTimer}
              className="h-6 w-6 rounded-full"
            >
              <TimerIcon className="h-3 w-3 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>
              {isVisible
                ? isRunning
                  ? "Pause timer"
                  : "Resume timer"
                : "Start timer"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isVisible && (
        <>
          <span className="text-xs font-medium text-muted-foreground">
            {formatTime(time)}
          </span>

          <TooltipProvider delayDuration={300}>
            {isRunning ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={pauseTimer}
                    className="h-5 w-5 rounded-full"
                  >
                    <PauseIcon className="h-2.5 w-2.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Pause timer</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={startTimer}
                    className="h-5 w-5 rounded-full"
                  >
                    <PlayIcon className="h-2.5 w-2.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Resume timer</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={resetTimer}
                  className="h-5 w-5 rounded-full"
                  disabled={time === 0}
                >
                  <ResetIcon className="h-2.5 w-2.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Reset timer</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={hideTimer}
                  className="h-5 w-5 rounded-full"
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Hide timer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
};

export default function CodeEditor() {
  const { theme: uiTheme } = useTheme();
  const defaultEditorTheme = uiTheme === "dark" ? "twilight" : "github";

  const [code, setCode] = React.useState<string>("// Write your code here");
  const [language, setLanguage] = React.useState<string>("javascript");
  const [theme, setTheme] = React.useState<string>(defaultEditorTheme);

  // Update editor theme when UI theme changes
  useEffect(() => {
    setTheme(uiTheme === "dark" ? "twilight" : "github");
  }, [uiTheme]);

  const handleCodeChange = (newValue: string) => {
    setCode(newValue);
  };

  const run = () => {
    console.log("Running code:", {
      code,
      language,
    });
    // This is where you would execute the code
  };

  const submit = () => {
    console.log("Submitting code:", {
      code,
      language,
    });
    // This is where you would submit the code to your backend
  };

  return (
    <div className="w-full h-full flex flex-col">
      <EditorNav
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        onRun={run}
        onSubmit={submit}
      />
      <div className="flex-grow">
        <AceEditor
          style={{ width: "100%", height: "100%" }}
          mode={language}
          theme={theme}
          value={code}
          onChange={handleCodeChange}
          name="code-editor"
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}

const EditorNav = ({
  theme,
  setTheme,
  language,
  setLanguage,
  onRun,
  onSubmit,
}: {
  theme: string;
  setTheme: (theme: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  onRun: () => void;
  onSubmit: () => void;
}) => {
  const availableThemes = [
    { value: "github", label: "Light" },
    { value: "twilight", label: "Dark" },
  ];

  return (
    <div className="py-2 px-1 flex justify-between items-center border-b">
      <div className="flex items-center space-x-3">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Language:
          </span>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="h-6 text-xs px-2 w-24 border-none">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem
                  key={lang.value}
                  value={lang.value}
                  className="text-xs"
                >
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Theme:
          </span>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="h-6 text-xs px-2 w-20 border-none">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {availableThemes.map((t) => (
                <SelectItem key={t.value} value={t.value} className="text-xs">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-4" />

        <Timer />
      </div>

      <div className="flex items-center gap-1">
        <Button
          onClick={onRun}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <PlayIcon className="h-3 w-3" />
          Run
        </Button>
        <Button onClick={onSubmit} size="sm" className="gap-1">
          <PaperPlaneIcon className="h-3 w-3" />
          Submit
        </Button>
      </div>
    </div>
  );
};
