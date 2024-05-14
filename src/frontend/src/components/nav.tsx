"use client";

import { ModeToggle } from "./mode-toggle";

export function Navbar() {
  return (
    <header className="w-full flex fixed p-2 justify-between items-center">
      <div>
        <ModeToggle />
      </div>
      <div>
        <ModeToggle />
      </div>
    </header>
  );
}
