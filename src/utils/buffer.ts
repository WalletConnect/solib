// import { Buffer } from "buffer";

export const polyfill = () => {
  // // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  // if (window && typeof window !== "undefined" && !window.Buffer)
  //   window.Buffer = Buffer;

  console.log("ran polyfill");
};
