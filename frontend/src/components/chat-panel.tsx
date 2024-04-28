"use client";
import { useState } from "react";
import { AskInput } from "./ask-input";
import {
  AssistantMessage,
  ChatMessage,
  MessageType,
  UserMessage,
} from "@/types";
import { SearchResults } from "./search-results";
import RelatedQuestions from "./related-questions";
import { Separator } from "./ui/separator";
import { useChat } from "@/hooks/chat";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col mb-8">
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
        {sources && <SearchResults results={sources} />}
      </Section>
      <Section title="Answer">
        <span className="text-md">{content}</span>
      </Section>
      <Separator className="mb-8" />
      <Section title="Related ">
        {relatedQuestions && <RelatedQuestions questions={relatedQuestions} />}
      </Section>
    </div>
  );
};

const Messages = ({ messages }: { messages: ChatMessage[] }) => {
  return (
    <div className="flex flex-col">
      {messages.map((message, index) =>
        message.role === MessageType.USER ? (
          <UserMessageContent key={index} message={message} />
        ) : (
          <AssistantMessageContent key={index} message={message} />
        )
      )}
    </div>
  );
};

export const ChatPanel = () => {
  const { handleSend } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: MessageType.USER, content: "who is elon musk" },
    {
      role: MessageType.ASSISTANT,
      content:
        "Elon Musk is a South African-born American entrepreneur and investor who is the founder, CEO, and CTO of SpaceX, CEO and product architect of Tesla, Inc., founder of The Boring Company, and co-founder of Neuralink and OpenAI",
      sources: [
        {
          title: "Elon Musk",
          url: "https://en.wikipedia.org/wiki/Elon_Musk",
          content: "Elon Musk is the CEO of Tesla",
        },
        {
          title: "Who Is Elon Musk? - Investopedia",
          url: "https://www.investopedia.com/who-is-elon-musk-5207306",
          content:
            "A comprehensive article detailing Elon Musk's career and achievements.",
        },
      ],
      relatedQuestions: [
        "What are some of Elon Musk's notable achievements?",
        "What is Elon Musk's net worth?",
        "What is Elon Musk's educational background?",
      ],
    },
  ]);
  if (messages.length > 0) {
    return (
      <div>
        <Messages messages={messages} />;
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
