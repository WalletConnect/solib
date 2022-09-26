import Store from "../store";
import { BaseConnector } from "./base";

export interface PhantonPublicKey {
  length: number;
  negative: number;
  words: Uint8Array;
  toString: () => string;
}

interface RequestMethods {
  signMessage: {
    params: {
      message: Uint8Array;
      format: string;
    };
    returns: {
      signature: string;
    };
  };
}

declare global {
  interface Window {
    phantom?: {
      solana: {
        connect: () => Promise<{ publicKey: PhantonPublicKey }>;
        disconnect: () => Promise<void>;
        request: (params: any) => any;
        signMessage: (
          message: Uint8Array,
          format: string
        ) => Promise<{ signature: Uint8Array }>;
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
    new Store().setAddress(resp.publicKey.toString());

    return { publicKey: resp.publicKey.toString() };
  }

  private async request<Method extends keyof RequestMethods>(
    method: Method,
    params: RequestMethods[Method]["params"]
  ): Promise<RequestMethods[Method]["returns"]> {
    return this.getProvider()?.request({ method, params });
  }

  public async signMessage(message: string) {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await this.request("signMessage", {
      message: encodedMessage,
      format: "utf8",
    });
    return signedMessage.signature;
  }
}
