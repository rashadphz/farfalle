import React, { FC, memo, useEffect, useMemo, useState } from "react";
import { MemoizedReactMarkdown } from "./markdown";
import rehypeRaw from "rehype-raw";

import _ from "lodash";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { ChatMessage } from "../../generated";

function chunkString(str: string): string[] {
  const words = str.split(" ");
  const chunks = _.chunk(words, 2).map((chunk) => chunk.join(" ") + " ");
  return chunks;
}

export interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

const CitationText = ({ number, href }: { number: number; href: string }) => {
  return `
  <button className="select-none no-underline">
  <a className="" href="${href}" target="_blank">
        <span className="relative -top-[0rem] inline-flex">
          <span className="h-[1rem] min-w-[1rem] items-center justify-center rounded-full  text-center px-1 text-xs font-mono bg-muted text-[0.60rem] text-muted-foreground">
            ${number}
          </span>
        </span>
      </a>
    </button>`;
};

const Text = ({
  children,
  isStreaming,
  containerElement = "p",
}: {
  children: React.ReactNode;
  isStreaming: boolean;
  containerElement: React.ElementType;
}) => {
  const renderText = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === "string") {
      const chunks = isStreaming ? chunkString(node) : [node];
      return chunks.flatMap((chunk, index) => {
        return (
          <span
            key={`${index}-streaming`}
            className={cn(
              isStreaming ? "animate-in fade-in-25 duration-700" : "",
            )}
          >
            {chunk}
          </span>
        );
      });
    } else if (React.isValidElement(node)) {
      return React.cloneElement(
        node,
        node.props,
        renderText(node.props.children),
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
      <Text isStreaming={true} containerElement="p">
        {children}
      </Text>
    );
  },
);
const Paragraph = memo(
  ({ children }: React.HTMLProps<HTMLParagraphElement>) => {
    return (
      <Text isStreaming={false} containerElement="p">
        {children}
      </Text>
    );
  },
);

const ListItem = memo(({ children }: React.HTMLProps<HTMLLIElement>) => {
  return (
    <Text isStreaming={false} containerElement="li">
      {children}
    </Text>
  );
});

const StreamingListItem = memo(
  ({ children }: React.HTMLProps<HTMLLIElement>) => {
    return (
      <Text isStreaming={true} containerElement="li">
        {children}
      </Text>
    );
  },
);

StreamingParagraph.displayName = "StreamingParagraph";
Paragraph.displayName = "Paragraph";
ListItem.displayName = "ListItem";
StreamingListItem.displayName = "StreamingListItem";

export const MessageComponent: FC<MessageProps> = ({
  message,
  isStreaming = false,
}) => {
  const { content, sources } = message;
  const [parsedMessage, setParsedMessage] = useState<string>(content);

  useEffect(() => {
    const citationRegex = /(\[\d+\])/g;
    const newMessage = content.replace(citationRegex, (match) => {
      const number = match.slice(1, -1);
      const source = sources?.find(
        (source, idx) => idx + 1 === parseInt(number),
      );
      return CitationText({
        number: parseInt(number),
        href: source?.url ?? "",
      });
    });
    setParsedMessage(newMessage);
  }, [content, sources]);

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
      rehypePlugins={[rehypeRaw]}
    >
      {parsedMessage}
    </MemoizedReactMarkdown>
  );
};

export const MessageComponentSkeleton = () => {
  return (
    <>
      <Skeleton className="w-full py-4 bg-card">
        <div className="flex flex-col gap-4">
          <Skeleton className="mx-5 h-2 bg-primary/30" />
          <Skeleton className="mx-5 h-2 bg-primary/30 mr-20" />
          <Skeleton className="mx-5 h-2 bg-primary/30 mr-40" />
        </div>
      </Skeleton>
    </>
  );
};
