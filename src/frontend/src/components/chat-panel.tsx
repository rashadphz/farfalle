"use client";

import { useChat } from "@/hooks/chat";
import { useMessageStore } from "@/stores";
import { MessageType } from "@/types";
import { useEffect, useRef, useState } from "react";
import { AskInput } from "./ask-input";

import MessagesList from "./messages-list";
import { ModelSelection } from "./model-selection";
import { StarterQuestionsList } from "./starter-questions";

export const ChatPanel = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleSend, streamingMessage } = useChat();
  const { messages } = useMessageStore();

  const [width, setWidth] = useState(0);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const messageBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const updatePosition = () => {
      if (messagesRef.current) {
        setWidth(messagesRef.current.scrollWidth);
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, [messages]);

  useEffect(() => {
    if (messages.at(-1)?.role === MessageType.USER) {
      messageBottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  if (messages.length > 0) {
    return (
      <div ref={messagesRef} className="pt-10 w-full relative">
        <MessagesList
          messages={messages}
          streamingMessage={streamingMessage}
          onRelatedQuestionSelect={handleSend}
        />
        <div ref={messageBottomRef} className="h-0" />
        <div
          className="bottom-16 fixed px-2 max-w-screen-md justify-center items-center md:px-2"
          style={{ width: `${width}px` }}
        >
          <AskInput isFollowingUp sendMessage={handleSend} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="flex items-center justify-center mb-8">
        <span className="text-3xl">Ask anything</span>
      </div>
      <AskInput sendMessage={handleSend} />
      <div className="w-full flex flex-row px-3 justify-between space-y-2 pt-1">
        <StarterQuestionsList handleSend={handleSend} />
        <ModelSelection />
      </div>
    </div>
  );
};
