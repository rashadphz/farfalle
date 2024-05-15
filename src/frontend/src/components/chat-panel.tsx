"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AskInput } from "./ask-input";
import {
  AssistantMessage,
  ChatMessage,
  MessageType,
  UserMessage,
} from "@/types";
import { SearchResults, SearchResultsSkeleton } from "./search-results";
import RelatedQuestions from "./related-questions";
import { Separator } from "./ui/separator";
import { useChat } from "@/hooks/chat";
import { MessageComponent, MessageComponentSkeleton } from "./message";
import { useMessageStore } from "@/stores";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  ArrowUpRightSquare,
  ListPlusIcon,
  SparkleIcon,
  StarIcon,
  TextSearchIcon,
} from "lucide-react";

import { motion } from "framer-motion";
import { ModelSelection } from "./model-selection";

const starterQuestions = [
  "what is farfalle?",
  "what's new with openai?",
  "what is groq?",
];

const Section = ({
  title,
  children,
  animate = true,
  streaming = false,
}: {
  title: "Sources" | "Answer" | "Related";
  children: React.ReactNode;
  animate?: boolean;
  streaming?: boolean;
}) => {
  const iconMap = {
    Sources: TextSearchIcon,
    Answer: SparkleIcon,
    Related: ListPlusIcon,
  };

  const IconComponent = iconMap[title] || StarIcon;

  return (
    <div
      className={cn(
        "flex flex-col mb-8",
        animate ? "animate-in fade-in duration-1000 ease-out" : ""
      )}
    >
      <div className="flex items-center space-x-2">
        {title === "Answer" && streaming ? (
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          >
            <IconComponent size={22} />
          </motion.div>
        ) : (
          <IconComponent size={22} />
        )}
        <div className="text-lg font-medium">{title}</div>
      </div>
      <div className="pt-1">{children}</div>
    </div>
  );
};

const UserMessageContent = ({ message }: { message: UserMessage }) => {
  return (
    <div className="my-4">
      <span className="text-3xl">{message.content}</span>
    </div>
  );
};

const AssistantMessageContent = ({
  message,
  isStreaming = false,
  onRelatedQuestionSelect,
}: {
  message: AssistantMessage;
  isStreaming?: boolean;
  onRelatedQuestionSelect: (question: string) => void;
}) => {
  const { sources, content, relatedQuestions, images } = message;
  return (
    <div className="flex flex-col">
      <Section title="Sources" animate={isStreaming}>
        {!sources || sources.length === 0 ? (
          <SearchResultsSkeleton />
        ) : (
          <SearchResults results={sources} />
        )}
      </Section>
      <Section title="Answer" animate={isStreaming} streaming={isStreaming}>
        {content ? (
          <MessageComponent message={message} isStreaming={isStreaming} />
        ) : (
          <MessageComponentSkeleton />
        )}
        {images && images.length > 0 && (
          <div className="my-4 grid grid-cols-1 gap-2 lg:grid-cols-2">
            {images.map((image) => (
              <a
                key={image}
                href={image}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-video w-full h-full overflow-hidden hover:scale-[1.03] duration-150 rounded-lg transition-all shadow-md"
              >
                <img
                  src={image}
                  className="w-full object-cover object-top h-full max-h-[80vh]"
                />
              </a>
            ))}
          </div>
        )}
      </Section>
      {relatedQuestions && relatedQuestions.length > 0 && (
        <Section title="Related" animate={isStreaming}>
          <RelatedQuestions
            questions={relatedQuestions}
            onSelect={onRelatedQuestionSelect}
          />
        </Section>
      )}
    </div>
  );
};

const Messages = ({
  messages,
  streamingMessage,
  onRelatedQuestionSelect,
}: {
  messages: ChatMessage[];
  streamingMessage: AssistantMessage | null;
  onRelatedQuestionSelect: (question: string) => void;
}) => {
  return (
    <div className="flex flex-col pb-28">
      {messages.map((message, index) =>
        message.role === MessageType.USER ? (
          <UserMessageContent key={index} message={message} />
        ) : (
          <>
            <AssistantMessageContent
              key={index}
              message={message}
              onRelatedQuestionSelect={onRelatedQuestionSelect}
            />
            {index !== messages.length - 1 && <Separator />}
          </>
        )
      )}
      {streamingMessage && (
        <AssistantMessageContent
          message={streamingMessage}
          isStreaming={true}
          onRelatedQuestionSelect={onRelatedQuestionSelect}
        />
      )}
    </div>
  );
};

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
        <Messages
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
        <ul className="flex flex-col space-y-1 pt-2">
          {starterQuestions.map((question) => (
            <li key={question} className="flex items-center space-x-2">
              <ArrowUpRight size={18} className="text-tint" />
              <button
                onClick={() => handleSend(question)}
                className="font-medium hover:underline decoration-tint underline-offset-4 transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
              >
                {question}
              </button>
            </li>
          ))}
        </ul>

        <ModelSelection />
      </div>
    </div>
  );
};
