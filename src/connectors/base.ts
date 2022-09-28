import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { proxy } from "valtio";
import { solanaClusters } from "../defaults/clusters";
import Store from "../store";
import {
  ClusterRequestMethods,
  ClusterSubscribeRequestMethods,
  RequestMethods,
  TransactionArgs,
  TransactionType,
} from "../types/requests";
import { ClusterFactory } from "../utils/clusterFactory";
import { waitForOpenConnection } from "../utils/websocket";

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
  watchTransaction: (transactionSignature: string) => any;
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

  public async watchTransaction(transactionSignature: string) {
    this.subscribeToCluster(
      "signatureSubscribe",
      [transactionSignature],
      (params) => {
        console.log({ transactionAction: params.context });
      }
    );
  }

  public async getBalance(requestedAddress?: string) {
    const address = requestedAddress ?? new Store().getAddress();
    if (!address) return null;

    const balance = await this.requestCluster("getBalance", [address]);

    return balance.value;
  }

  public async subscribeToCluster<
    Method extends keyof ClusterSubscribeRequestMethods
  >(
    method: Method,
    params: ClusterSubscribeRequestMethods[Method]["returns"],
    callback: (params: any) => void
  ) {
    ClusterFactory.registerListener(method, params, callback);
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
        body: JSON.stringify({
          method,
          params,
          jsonrpc: "2.0",
          id: new Store().getNewRequestId(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (res) => {
        const json = await res.json();

        console.log({ json });
        return json;
      });

    return res.result;
  }
}
