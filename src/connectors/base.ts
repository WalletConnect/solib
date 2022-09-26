import { ConnectResponse } from "../types/provider";

export interface BaseConnector {
  isAvailable: () => boolean;
  connect: () => Promise<ConnectResponse | null>;
  signMessage: (message: string) => any;
}
