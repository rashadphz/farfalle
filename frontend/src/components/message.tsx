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

const Citation = memo(({ number }: { number: number }) => {
  return (
    <a className="ml-1" target="_blank">
      <span className="relative -top-[0.2rem] inline-flex">
        <span className="h-[1rem] min-w-[1rem] items-center justify-center rounded-full  text-center px-1 text-xs font-mono bg-muted text-[0.60rem] ">
          {number}
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
  console.log({ children });
  const citationMatch = /(\[\d+\])/g;

  const renderText = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === "string") {
      const chunks = isStreaming ? chunkString(node) : [node];
      return chunks.flatMap((chunk, index) => {
        const parts = chunk.split(citationMatch);
        return parts.map((part, partIndex) => {
          if (part.match(citationMatch)) {
            const number = part.slice(1, -1);
            return (
              <Citation
                key={`${index}-${partIndex}`}
                number={parseInt(number)}
              />
            );
          }
          return (
            <span
              key={`${index}-${partIndex}-streaming`}
              className={cn(
                isStreaming ? "animate-in fade-in-25 duration-700" : ""
              )}
            >
              {part}
            </span>
          );
        });
      });
    } else if (React.isValidElement(node)) {
      return React.cloneElement(
        node,
        node.props,
        renderText(node.props.children)
      );
    } else if (Array.isArray(node)) {
      return node.map((child, index) => (
        <React.Fragment key={index}>{renderText(child)}</React.Fragment>
      ));
    }
    return null;
  };

  const text = renderText(children);
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
        // citation: Citation,
      }}
      className="prose dark:prose-invert inline leading-relaxed break-words "
    >
      {message}
    </MemoizedReactMarkdown>
  );
};
