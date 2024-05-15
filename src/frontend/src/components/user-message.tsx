import { UserMessage } from "@/types";

export const UserMessageContent = ({ message }: { message: UserMessage }) => {
  return (
    <div className="my-4">
      <span className="text-3xl">{message.content}</span>
    </div>
  );
};
