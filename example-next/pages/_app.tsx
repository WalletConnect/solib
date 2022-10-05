import "../styles/globals.css";
import type { AppProps } from "next/app";
import { getDefaultConnectors, init } from "solib";
import { ColorModeProvider, ChakraProvider } from "@chakra-ui/react";

init({ connectors: getDefaultConnectors(), chosenCluster: "devnet" });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <ColorModeProvider>
        <Component {...pageProps} />
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export default MyApp;
