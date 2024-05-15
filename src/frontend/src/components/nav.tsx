"use client";

import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "./mode-toggle";

export function Navbar() {
  return (
    <header className="w-full flex fixed p-1 z-50 px-2 bg-background justify-between items-center">
      <div>
        <Link href="/" passHref onClick={() => location.reload()}>
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
        </Link>
      </div>
      <div>
        <ModeToggle />
      </div>
    </header>
  );
}
