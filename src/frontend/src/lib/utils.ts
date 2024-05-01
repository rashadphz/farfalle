import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { fromDom } from "hast-util-from-dom";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
