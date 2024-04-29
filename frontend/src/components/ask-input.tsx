import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export const AskInput = ({
  input,
  setInput,
  inputRef,
}: {
  input: string;
  setInput: (input: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) => {
  return (
    <>
      <div className="">
        <Input
          placeholder="Ask anything..."
          autoFocus
          autoComplete="off"
          spellCheck="false"
          className="w-full max-h-[30vh] p-4 focus:outline-none flex-grow text-md resize-none h-10 outline-none rounded-3xl"
          onChange={(e) => setInput(e.target.value)}
          value={input}
          ref={inputRef}
        />
      </div>
    </>
  );
};
