import { solanaClusters } from "../defaults/clusters";
import Store from "../store";
import { ConnectResponse } from "../types/provider";

export interface ClusterRequestMethods {
  sendTransaction: {
    // Signed, serialized transaction
    params: Array<string>;
    returns: string;
  };

  getBalance: {
    params: Array<string>;
    returns: {
      value: number;
    };
  };

  getLatestBlockhash: {
    params: [{ commitment: string }];
    returns: {
      value: {
        blockhash: string;
      };
    };
  };
}

export interface RequestMethods {
  signMessage: {
    params: {
      message: Uint8Array;
      format: string;
    };
    returns: {
      signature: string;
    };
  };

  signTransaction: {
    params: {
      // Serialized transaction
      message: string;
    };
    returns: {
      serialize: () => string;
    };
  };
}

export type TransactionType = "transfer";
export type TransactionArgs = {
  to: string;
  amountInLamports: number;
  type: TransactionType;
};

export interface Connector {
  isAvailable: () => boolean;
  connect: () => Promise<ConnectResponse | null>;
  signMessage: (message: string) => any;
  signAndSendTransaction: (
    params: TransactionArgs
  ) => Promise<{ signature: string }>;
  getBalance: (requestedAddress?: string) => any;
}

export class BaseConnector {
  protected getProvider(): {
    request: (args: { method: any; params: any }) => any;
  } | null {
    return null;
  }

  public async request<Method extends keyof RequestMethods>(
    method: Method,
    params: RequestMethods[Method]["params"]
  ): Promise<RequestMethods[Method]["returns"]> {
    return this.getProvider()?.request({ method, params });
  }

  public async requestCluster<Method extends keyof ClusterRequestMethods>(
    method: Method,
    params: ClusterRequestMethods[Method]["params"]
  ): Promise<ClusterRequestMethods[Method]["returns"]> {
    const cluster = new Store().getCluster();
    const endpoint = solanaClusters[cluster].endpoint;
    const res: { result: ClusterRequestMethods[Method]["returns"] } =
      await fetch(endpoint, {
        method: "post",
        body: JSON.stringify({ method, params, jsonrpc: "2.0", id: 1 }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        return res.json();
      });

    console.log({ res });

    return res.result;
  }
}
