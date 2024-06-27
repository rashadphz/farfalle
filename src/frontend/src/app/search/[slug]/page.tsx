"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "../../../../generated";
import { ChatPanel } from "@/components/chat-panel";

export default function ChatPage() {
  const { slug } = useParams();
  const threadId = parseInt(slug as string, 10);

  return (
    <div className="h-screen">
      <div className="flex grow h-full mx-auto max-w-screen-md px-4 md:px-8">
        <Suspense>
          <ChatPanel threadId={threadId} />
        </Suspense>
      </div>
    </div>
  );
}
