import React, { FC, memo } from "react";
import { MemoizedReactMarkdown } from "./markdown";
import _ from "lodash";

function chunkString(str: string): string[] {
  const words = str.split(" ");
  const chunks = _.chunk(words, 2).map((chunk) => chunk.join(" ") + " ");
  return chunks;
}

export interface MessageProps {
  message: string;
}

// Fix for the animation delay
const MemoizedParagraph = memo(
  ({ children }: React.HTMLProps<HTMLParagraphElement>) => (
    <p>
      {chunkString(children?.toString() || "").map((chunk, index) => (
        <span key={index} className="animate-in fade-in-25 duration-700">
          {chunk}
        </span>
      ))}
    </p>
  ),
  (prevProps, nextProps) => {
    return prevProps.children === nextProps.children;
  }
);

MemoizedParagraph.displayName = "MemoizedParagraph";

export const MessageComponent: FC<MessageProps> = ({ message }) => {
  return (
    <MemoizedReactMarkdown
      components={{
        // @ts-ignore
        p: MemoizedParagraph,
      }}
      className="prose-base prose-neutral"
    >
      {message}
    </MemoizedReactMarkdown>
  );
};
