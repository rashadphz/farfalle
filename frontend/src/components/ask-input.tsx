import { Textarea } from "./ui/textarea";

export const AskInput = () => {
  return (
    <>
      <div className="w-full outline-none focus:outline-none border focus:ring-1 rounded-md">
        <Textarea
          placeholder="Ask anything..."
          autoFocus
          autoComplete="off"
          spellCheck="false"
          className="max-h-[40vh] p-4 focus:outline-none flex-grow text-md resize-none h-14 outline-none"
        />
      </div>
    </>
  );
};
