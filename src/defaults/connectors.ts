import { PhantomConnector } from "../connectors/phantom";
import { WalletConnectConnector } from "../connectors/walletconnect";

export const DEFAULT_APP_METADATA = {
  name: "react app",
  description: "react app for walletconnect",
  url: "https://walletconnect.com/",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export function getDefaultConnectors() {
  return [
    new WalletConnectConnector(
      "e899c82be21d4acca2c8aec45e893598",
      "wss://relay.walletconnect.com/",
      DEFAULT_APP_METADATA
    ),
    new PhantomConnector(),
  ];
}
