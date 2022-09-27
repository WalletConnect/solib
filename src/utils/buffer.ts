import { Buffer } from "buffer";

export const polyfill = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof window !== "undefined" && !window.Buffer) window.Buffer = Buffer;
};
