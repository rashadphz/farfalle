import { AskInput } from "./ask-input";

export const ChatPanel = () => {
  return (
    <div className="h-screen">
      <div className="flex grow h-full mx-auto max-w-screen-md px-4 md:px-8">
        <div className="w-full flex flex-col justify-center items-center">
          <div className="flex items-center justify-center mb-8">
            <span className="text-3xl">?</span>
          </div>
          <AskInput />
        </div>
      </div>
    </div>
  );
};
