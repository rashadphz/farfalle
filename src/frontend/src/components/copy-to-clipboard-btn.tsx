import { CheckIcon, Clipboard } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

type Props = {
  content: string;
};

export const CopyToClipboardBtn = (props: Props) => {
  const { content } = props;
  const [copiedText, copy] = useCopyToClipboard({ clear: true });
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          onClick={() => {
            copy(content);
          }}
          size={"sm"}
          variant="ghost"
        >
          {copiedText ? (
            <CheckIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Clipboard className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </HoverCardTrigger>

      <HoverCardContent className="p-2 w-[60px]">
        <p className="text-muted-foreground text-xs text-center">Copy</p>
      </HoverCardContent>
    </HoverCard>
  );
};
