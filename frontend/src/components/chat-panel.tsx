"use client";
import { useState } from "react";
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
import { MessageComponent } from "./message";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col mb-8 animate-in fade-in duration-1000 ease-out">
      <div className="text-lg font-medium">{title}</div>
      <div>{children}</div>
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
}: {
  message: AssistantMessage;
}) => {
  const { sources, content, relatedQuestions } = message;
  return (
    <div className="flex flex-col">
      <Section title="Sources">
        {!sources || sources.length === 0 ? (
          <SearchResultsSkeleton />
        ) : (
          <SearchResults results={sources} />
        )}
      </Section>
      <Section title="Answer">
        <MessageComponent message={content} />
      </Section>
      <Separator className="mb-8" />
      {relatedQuestions && relatedQuestions.length > 0 && (
        <Section title="Related ">
          <RelatedQuestions questions={relatedQuestions} />
        </Section>
      )}
    </div>
  );
};

const Messages = ({
  messages,
  streamingMessage,
}: {
  messages: ChatMessage[];
  streamingMessage: AssistantMessage | null;
}) => {
  return (
    <div className="flex flex-col">
      {messages.map((message, index) =>
        message.role === MessageType.USER ? (
          <UserMessageContent key={index} message={message} />
        ) : (
          <AssistantMessageContent key={index} message={message} />
        )
      )}
      {streamingMessage && (
        <AssistantMessageContent message={streamingMessage} />
      )}
    </div>
  );
};

export const ChatPanel = () => {
  const { handleSend, streamingMessage } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: MessageType.USER, content: "who is rashad philizaire" },
  ]);
  if (messages.length > 0) {
    return (
      <div className="w-full">
        <Messages messages={messages} streamingMessage={streamingMessage} />;
        <button onClick={() => handleSend({ query: "who is elon musk" })}>
          Send
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="flex items-center justify-center mb-8">
        <span className="text-3xl">?</span>
      </div>
      <AskInput />
    </div>
  );
};
