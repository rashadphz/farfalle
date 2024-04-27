import { FC } from "react";
import { MemoizedReactMarkdown } from "./markdown";

export interface MessageProps {
  message: string;
}

export const MessageComponent: FC<MessageProps> = ({ message }) => {
  return (
    <MemoizedReactMarkdown className="prose-base prose-neutral">
      {message}
    </MemoizedReactMarkdown>
  );
};
