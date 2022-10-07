import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
  init,
  mainnetBetaWalletConnect,
  PhantomConnector,
  WalletConnectConnector,
} from "solib";
import { ColorModeProvider, ChakraProvider } from "@chakra-ui/react";

init({
  connectorId: "walletconnect",
  connectors: [
    new PhantomConnector(),
    new WalletConnectConnector(
      "e899c82be21d4acca2c8aec45e893598",
      "wss://relay.walletconnect.com",
      {
        description: "Test app for solib",
        name: "Test Solib dApp",
        icons: ["https://avatars.githubusercontent.com/u/37784886"],
        url: "http://localhost:3000",
      },
      true
    ),
  ],
  chosenCluster: mainnetBetaWalletConnect("e899c82be21d4acca2c8aec45e893598"),
});

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
