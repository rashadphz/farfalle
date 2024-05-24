import { AssistantMessage, ChatMessage, MessageType } from "@/types";
import { AssistantMessageContent } from "./assistant-message";
import { Separator } from "./ui/separator";
import { UserMessageContent } from "./user-message";
import { memo } from "react";

const MessagesList = ({
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
        ),
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

export default memo(MessagesList);
