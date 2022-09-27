import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { solanaClusters } from "../defaults/clusters";
import Store from "../store";
import {
  ClusterRequestMethods,
  RequestMethods,
  TransactionArgs,
  TransactionType,
} from "../types/requests";

export interface Connector {
  isAvailable: () => boolean;
  connect: () => Promise<string>;
  signMessage: (message: string) => any;
  signTransaction: <Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) => Promise<string>;
  sendTransaction: (encodedTransaction: string) => Promise<string>;
  signAndSendTransaction: <Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) => Promise<string>;
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

  protected async constructTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) {
    const transaction = new Transaction();

    const fromAddress = new Store().getAddress();

    if (!fromAddress) throw new Error("No address connected");

    switch (type) {
      case "transfer":
        const fromPubkey = new PublicKey(fromAddress);
        const toPubkey = new PublicKey(params.to);
        transaction.add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: params.amountInLamports,
          })
        );
        transaction.feePayer =
          params.feePayer === "from" ? fromPubkey : toPubkey;
    }

    let { value } = await this.requestCluster("getLatestBlockhash", [{}]);
    const { blockhash: recentBlockhash } = value;
    transaction.recentBlockhash = recentBlockhash;

    return transaction;
  }

  public async sendTransaction(encodedTransaction: string) {
    const signature = await this.requestCluster("sendTransaction", [
      encodedTransaction,
    ]);

    return signature;
  }

  public async getBalance(requestedAddress?: string) {
    const address = requestedAddress ?? new Store().getAddress();
    if (!address) return null;

    const balance = await this.requestCluster("getBalance", [address]);

    return balance.value;
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

    return res.result;
  }
}
