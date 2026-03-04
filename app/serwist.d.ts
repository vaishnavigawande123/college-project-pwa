
import type { PrecacheEntry } from "serwist";

declare global {
  interface Window {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}