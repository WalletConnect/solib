import { ConnectResponse } from "../types/provider";
import { BaseConnector } from "./base";

declare global {
  interface Window {
    phantom?: {
      solana: {
        connect: () => Promise<ConnectResponse>;
        disconnect: () => Promise<void>;
      };
    };
  }
}
export class PhantomConnector implements BaseConnector {
  private getProvider() {
    if (typeof window !== "undefined" && window.phantom) {
      return window.phantom.solana;
    }
    return null;
  }

  public isAvailable(): boolean {
    return !!this.getProvider();
  }

  public async connect() {
    if (!this.getProvider()) {
      return null;
    }
    const resp = await this.getProvider()!.connect();
    return resp;
  }
}
