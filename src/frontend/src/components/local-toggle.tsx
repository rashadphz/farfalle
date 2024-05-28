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
import { env } from "@/env.mjs";
import { memo } from "react";

const LocalToggle = () => {
  const { localMode, toggleLocalMode } = useConfigStore();

  return (
    <HoverCard>
      <HoverCardTrigger
        asChild
        className={cn(
          "hover:cursor-pointer",
          !env.NEXT_PUBLIC_LOCAL_MODE_ENABLED && "hover:cursor-not-allowed",
        )}
        onClick={toggleLocalMode}
      >
        <div className="group flex space-x-2 items-center justify-end pr-3 hover:text-primary">
          <Switch
            disabled={!env.NEXT_PUBLIC_LOCAL_MODE_ENABLED}
            checked={localMode}
          />
          <span
            className={cn(
              "font-bold text-sm transition-all",
              localMode ? "text-tint " : "text-gray-500 group-hover:text-white",
            )}
          >
            Local
          </span>
          {localMode ? (
            <CloudOffIcon className="h-[1.2rem] w-[1.2rem] text-tint " />
          ) : (
            <CloudIcon className="h-[1.2rem] w-[1.2rem] transition-all text-gray-500 group-hover:text-white duration-100" />
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
              <li>Phi3</li>
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
};

export default memo(LocalToggle);
