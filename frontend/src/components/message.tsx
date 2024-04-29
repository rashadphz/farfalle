import React, { FC, memo, useMemo } from "react";
import { MemoizedReactMarkdown } from "./markdown";
import _ from "lodash";
import { cn } from "@/lib/utils";

function chunkString(str: string): string[] {
  const words = str.split(" ");
  const chunks = _.chunk(words, 2).map((chunk) => chunk.join(" ") + " ");
  return chunks;
}

export interface MessageProps {
  message: string;
  isStreaming?: boolean;
}

const Citation = memo(({ children }: React.HTMLProps<HTMLParagraphElement>) => {
  return (
    <a className="ml-1">
      <span className="relative -top-[0.2rem] inline-flex">
        <span className="h-[1rem] min-w-[1rem] items-center justify-center rounded-full  text-center px-1 text-xs font-mono bg-muted text-[0.60rem] ">
          {children}
        </span>
      </span>
    </a>
  );
});

const TextWithCitations = ({
  children,
  isStreaming,
  containerElement = "p",
}: {
  children: React.ReactNode;
  isStreaming: boolean;
  containerElement: React.ElementType;
}) => {
  const citationMatch = /(\[\d+\])/g;
  const chunks = chunkString(children?.toString() || "");
  const textWithCitations = isStreaming
    ? chunks.flatMap((chunk) => chunk.split(citationMatch))
    : children?.toString().split(citationMatch);

  const text = textWithCitations?.map((text, index) => {
    if (text.match(citationMatch)) {
      const number = text.slice(1, -1);
      return <Citation key={number}>{number}</Citation>;
    }
    return (
      <span
        key={`${index}-streaming`}
        className={cn(isStreaming ? "animate-in fade-in-25 duration-700" : "")}
      >
        {text}
      </span>
    );
  });

  console.log({ textWithCitations: children });

  return React.createElement(containerElement, {}, text);
};

const StreamingParagraph = memo(
  ({ children }: React.HTMLProps<HTMLParagraphElement>) => {
    return (
      <TextWithCitations isStreaming={true} containerElement="p">
        {children}
      </TextWithCitations>
    );
  }
);
const Paragraph = memo(
  ({ children }: React.HTMLProps<HTMLParagraphElement>) => {
    return (
      <TextWithCitations isStreaming={false} containerElement="p">
        {children}
      </TextWithCitations>
    );
  }
);

const ListItem = memo(({ children }: React.HTMLProps<HTMLLIElement>) => {
  return (
    <TextWithCitations isStreaming={false} containerElement="li">
      {children}
    </TextWithCitations>
  );
});

const StreamingListItem = memo(
  ({ children }: React.HTMLProps<HTMLLIElement>) => {
    return (
      <TextWithCitations isStreaming={true} containerElement="li">
        {children}
      </TextWithCitations>
    );
  }
);

StreamingParagraph.displayName = "StreamingParagraph";
Paragraph.displayName = "Paragraph";
Citation.displayName = "Citation";
ListItem.displayName = "ListItem";
StreamingListItem.displayName = "StreamingListItem";

export const MessageComponent: FC<MessageProps> = ({
  message,
  isStreaming = false,
}) => {
  return (
    <MemoizedReactMarkdown
      components={{
        // TODO: For some reason, can't pass props into the components
        // @ts-ignore
        p: isStreaming ? StreamingParagraph : Paragraph,
        // @ts-ignore
        li: isStreaming ? StreamingListItem : ListItem,
      }}
      className="prose dark:prose-invert inline leading-relaxed break-words "
    >
      {message}
    </MemoizedReactMarkdown>
  );
};
