import TextareaAutosize from "react-textarea-autosize";
import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowUp } from "lucide-react";
import ProToggle from "./pro-toggle";

import { ModelSelection } from "./model-selection";

const InputBar = ({
  input,
  setInput,
}: {
  input: string;
  setInput: (input: string) => void;
}) => {
  return (
    <div className="w-full flex flex-col rounded-md focus:outline-none px-2 py-1 bg-card border-2 ">
      <div className="w-full">
        <TextareaAutosize
          className="w-full bg-transparent text-md resize-none focus:outline-none p-2"
          placeholder="Ask anything..."
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
      </div>
      <div className="flex justify-between">
        <div>
          <ModelSelection />
        </div>
        <div className="flex items-center gap-2">
          <ProToggle />
          <Button
            type="submit"
            variant="default"
            size="icon"
            className="rounded-full bg-tint aspect-square h-8 w-8 disabled:opacity-20 hover:bg-tint/80 overflow-hidden"
            disabled={input.trim().length < 5}
          >
            <ArrowUp size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

const FollowingUpInput = ({
  input,
  setInput,
}: {
  input: string;
  setInput: (input: string) => void;
}) => {
  return (
    <div className="w-full flex flex-row rounded-full focus:outline-none px-2 py-1 bg-card border-2 items-center ">
      <div className="w-full">
        <TextareaAutosize
          className="w-full bg-transparent text-md resize-none focus:outline-none p-2"
          placeholder="Ask anything..."
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
      </div>
      <div className="flex items-center gap-2">
        <ProToggle />
        <Button
          type="submit"
          variant="default"
          size="icon"
          className="rounded-full bg-tint aspect-square h-8 w-8 disabled:opacity-20 hover:bg-tint/80 overflow-hidden"
          disabled={input.trim().length < 5}
        >
          <ArrowUp size={20} />
        </Button>
      </div>
    </div>
  );
};

export const AskInput = ({
  sendMessage,
  isFollowingUp = false,
}: {
  sendMessage: (message: string) => void;
  isFollowingUp?: boolean;
}) => {
  const [input, setInput] = useState("");
  return (
    <>
      <form
        className="w-full overflow-hidden"
        onSubmit={(e) => {
          if (input.trim().length < 5) return;
          e.preventDefault();
          sendMessage(input);
          setInput("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim().length < 5) return;
            sendMessage(input);
            setInput("");
          }
        }}
      >
        {isFollowingUp ? (
          <FollowingUpInput input={input} setInput={setInput} />
        ) : (
          <InputBar input={input} setInput={setInput} />
        )}
      </form>
    </>
  );
};
