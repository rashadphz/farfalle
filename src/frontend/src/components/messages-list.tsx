import { AssistantMessageContent } from "./assistant-message";
import { Separator } from "./ui/separator";
import { UserMessageContent } from "./user-message";
import { memo } from "react";
import {
  AgentSearchFullResponse,
  ChatMessage,
  MessageRole,
} from "../../generated";
import { ProSearchRender } from "./pro-search-render";

const MessagesList = ({
  messages,
  streamingMessage,
  isStreamingMessage,
  isStreamingProSearch,
  onRelatedQuestionSelect,
}: {
  messages: ChatMessage[];
  streamingMessage: ChatMessage | null;
  isStreamingMessage: boolean;
  isStreamingProSearch: boolean;
  onRelatedQuestionSelect: (question: string) => void;
}) => {
  const streamingProResponse = streamingMessage?.agent_response;
  return (
    <div className="flex flex-col pb-28">
      {messages.map((message, index) =>
        message.role === MessageRole.USER ? (
          <UserMessageContent key={index} message={message} />
        ) : (
          <>
            {message.agent_response && (
              <ProSearchRender streamingProResponse={message.agent_response} />
            )}
            <AssistantMessageContent
              key={index}
              message={message}
              onRelatedQuestionSelect={onRelatedQuestionSelect}
            />
            {index !== messages.length - 1 && <Separator />}
          </>
        ),
      )}
      {isStreamingProSearch && (
        <div className="mb-4">
          <ProSearchRender
            streamingProResponse={streamingProResponse ?? null}
            isStreamingProSearch={isStreamingProSearch}
          />
        </div>
      )}
      {streamingMessage && isStreamingMessage && (
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
