import { ChatPanel } from "@/components/chat-panel";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="h-screen">
      <div className="flex grow h-full mx-auto max-w-screen-md px-4 md:px-8">
        <Suspense>
          <ChatPanel />
        </Suspense>
      </div>
    </div>
  );
}
