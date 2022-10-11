// Import { Buffer } from "buffer";

export const polyfill = () => {
  // // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  // If (window && typeof window !== "undefined" && !window.Buffer)
  //   Window.Buffer = Buffer;

  console.log('ran polyfill')
}
