"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useChat } from "@/hooks/chat";
import { useMessageStore } from "@/stores";
import { MessageType } from "@/types";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AskInput } from "./ask-input";

import MessagesList from "./messages-list";
import { ModelSelection } from "./model-selection";
import { StarterQuestionsList } from "./starter-questions";
import LocalToggle from "./local-toggle";

const useAutoScroll = (ref: React.RefObject<HTMLDivElement>) => {
  const { messages } = useMessageStore();

  useEffect(() => {
    if (messages.at(-1)?.role === MessageType.USER) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, ref]);
};

const useAutoResizeInput = (
  ref: React.RefObject<HTMLDivElement>,
  setWidth: (width: number) => void,
) => {
  const { messages } = useMessageStore();

  useEffect(() => {
    const updatePosition = () => {
      if (ref.current) {
        setWidth(ref.current.scrollWidth);
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, [messages, ref, setWidth]);
};

const useAutoFocus = (ref: React.RefObject<HTMLTextAreaElement>) => {
  useEffect(() => {
    ref.current?.focus();
  }, [ref]);
};

export const ChatPanel = () => {
  const searchParams = useSearchParams();
  const queryMessage = searchParams.get("q");
  const hasRun = useRef(false);

  const { handleSend, streamingMessage } = useChat();
  const { messages } = useMessageStore();

  const [width, setWidth] = useState(0);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const messageBottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useAutoScroll(messageBottomRef);
  useAutoResizeInput(messagesRef, setWidth);
  useAutoFocus(inputRef);

  useEffect(() => {
    if (queryMessage && !hasRun.current) {
      hasRun.current = true;
      handleSend(queryMessage);
    }
  }, [queryMessage]);

  return (
    <>
      {messages.length > 0 ? (
        <div ref={messagesRef} className="pt-10 w-full relative">
          <MessagesList
            messages={messages}
            streamingMessage={streamingMessage}
            onRelatedQuestionSelect={handleSend}
          />
          <div ref={messageBottomRef} className="h-0" />
          <div
            className="bottom-12 fixed px-2 max-w-screen-md justify-center items-center md:px-2"
            style={{ width: `${width}px` }}
          >
            <AskInput isFollowingUp sendMessage={handleSend} />
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col justify-center items-center">
          <div className="flex items-center justify-center mb-8">
            <span className="text-3xl">Ask anything</span>
          </div>
          <AskInput sendMessage={handleSend} />
          <div className="w-full flex flex-row px-3 justify-between space-y-2 pt-1">
            <StarterQuestionsList handleSend={handleSend} />
            <div className="flex flex-col gap-2 items-end ">
              <ModelSelection />
              <LocalToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
