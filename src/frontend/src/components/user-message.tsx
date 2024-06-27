import { ChatMessage } from "../../generated";

export const UserMessageContent = ({ message }: { message: ChatMessage }) => {
  return (
    <div className="my-4">
      <span className="text-3xl">{message.content}</span>
    </div>
  );
};
