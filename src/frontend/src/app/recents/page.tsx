"use client";

import RecentChat from "@/components/recent-chat";
import { Separator } from "@/components/ui/separator";
import { useChatHistory } from "@/hooks/history";

export default function RecentsPage() {
  const { data: chats, isLoading } = useChatHistory();
  if (!chats) return <div>Loading...</div>;

  return (
    <div className="h-screen">
      <div className="mx-auto max-w-3xl pt-16 px-4">
        <h1 className="text-2xl font-bold mb-4">Chat History</h1>
        <Separator className="mb-4" />
        <ul className="flex flex-col gap-4">
          {chats.map((chat) => (
            <RecentChat key={chat.title} {...chat} />
          ))}
        </ul>
      </div>
    </div>
  );
}
