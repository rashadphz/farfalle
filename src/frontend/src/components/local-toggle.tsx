"use client";

import { CloudIcon, CloudOffIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConfigStore } from "@/stores";
import { Switch } from "./ui/switch";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "./ui/separator";

export function LocalToggle() {
  const { localMode, toggleLocalMode } = useConfigStore();

  return (
    <HoverCard>
      <HoverCardTrigger
        asChild
        className="hover:cursor-pointer"
        onClick={toggleLocalMode}
      >
        <div className="flex space-x-2 items-center justify-end pr-3 hover:text-primary">
          <Switch checked={localMode} />
          <span
            className={cn(
              "font-bold text-sm",
              localMode ? "text-tint" : "text-gray-500 hover:text-primary"
            )}
          >
            Local
          </span>
          {localMode ? (
            <CloudOffIcon className="h-[1.2rem] w-[1.2rem] transition-all text-tint" />
          ) : (
            <CloudIcon className="h-[1.2rem] w-[1.2rem] transition-all text-gray-500" />
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-3">
        <div className="flex flex-col items-start rounded-md ">
          <div className="text-lg font-semibold ">
            <span className="text-tint">Local </span>
            <span>Mode</span>
          </div>
          <div className="text-sm gap-y-1 flex flex-col ">
            <div>
              Use your local machine to host language models and answer
              questions.
            </div>
            <div>Currently supports:</div>
            <ul className="list-disc list-inside font-semibold">
              <li>Llama3</li>
              <li>Gemma</li>
              <li>Mistral</li>
            </ul>
          </div>
          <Separator className="mt-1" />
          <div className="text-xs text-muted-foreground mt-2">
            <span>Requires Ollama setup. </span>
            <a
              className="text-primary hover:underline"
              href="https://github.com/rashadphz/farfalle/"
              target="_blank"
              rel="noreferrer"
            >
              Learn more
            </a>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
