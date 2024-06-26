"use client";

import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { HistoryIcon, PlusIcon } from "lucide-react";
import { useChatStore } from "@/stores";
import { useRouter } from "next/navigation";

const NewChatButton = () => {
  return (
    <Button variant="secondary" size="sm" onClick={() => (location.href = "/")}>
      <PlusIcon className="w-4 h-4" />
      <span className="block">&nbsp;&nbsp;New</span>
    </Button>
  );
};

const TextLogo = () => {
  return <div className="text-2xl font-medium">farfalle</div>;
};

export function Navbar() {
  const router = useRouter();
  const { theme } = useTheme();
  const { messages } = useChatStore();

  const onHomePage = messages.length === 0;

  return (
    <header className="w-full flex fixed p-1 z-50 px-2 bg-background/95 justify-between items-center">
      <div className="flex items-center gap-2">
        <Link href="/" passHref onClick={() => (location.href = "/")}>
          <img
            src={theme === "light" ? "/logo-black.png" : "/logo-white.png"}
            alt="Logo"
            className="w-12 h-12"
          />
        </Link>
        {onHomePage ? <TextLogo /> : <NewChatButton />}
      </div>
      <div className="flex items-center gap-4">
        <Link href="/history" passHref>
          <div className="font-medium hover:underline decoration-tint underline-offset-4 transition-all duration-200 ease-in-out transform hover:scale-[1.02] text-left break-words normal-case">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4" />
              History
            </div>
          </div>
        </Link>
        <ModeToggle />
      </div>
    </header>
  );
}
