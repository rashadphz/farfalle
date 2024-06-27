"use client";

import { ErrorMessage } from "@/components/assistant-message";
import RecentChat from "@/components/recent-chat";
import { Separator } from "@/components/ui/separator";
import { useChatHistory } from "@/hooks/history";
import { HistoryIcon } from "lucide-react";
import React from "react";

export default function RecentsPage() {
  const { data: chats, isLoading, error } = useChatHistory();

  if (!error && !chats) return <div>Loading...</div>;

  return (
    <div className="h-screen ">
      <div className="mx-auto max-w-3xl pt-16 px-4 pb-16">
        <div className="flex items-center space-x-2 mb-3">
          <HistoryIcon className="w-5 h-5" />
          <h1 className="text-xl font-semibold">Chat History</h1>
        </div>
        <Separator className="mb-4" />
        {error && <ErrorMessage content={error.message} />}
        {chats && (
          <ul className="flex flex-col gap-4">
            {chats.map((chat, index) => (
              <React.Fragment key={chat.id}>
                <RecentChat {...chat} />
                {index < chats.length - 1 && <Separator className="" />}
              </React.Fragment>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
