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

const WebsocketFactory = (function () {
  let socket: WebSocket | undefined;
  let listeners: Record<
    number,
    { callback: (params: any) => void; method: string; id: number }
  > = proxy({});
  function setSocket() {
    const cluster = new Store().getCluster();
    const endpoint = solanaClusters[cluster].endpoint;
    socket = new WebSocket(endpoint.replace("http", "ws"));

    socket.onmessage = (ev) => {
      const data = JSON.parse(ev.data);

      console.log({ data, listeners });

      // If request is a subscribtion init notification
      // Copy data to new ID (request ID -> Subscribtion ID)
      if (data.id) {
        listeners[data.result] = { ...listeners[data.id] };
        delete listeners[data.id];
      }

      if (data.params?.subscription) {
        console.log("Found subscription", data.params.subscription);
        listeners[data.params.subscription].callback(data.params.result);
      }
    };
  }

  function registerListener<
    Method extends keyof ClusterSubscribeRequestMethods
  >(
    method: Method,
    params: ClusterSubscribeRequestMethods[Method]["params"],
    callback: (params: any) => void
  ) {
    if (!socket) throw new Error("socket not initialized");
    const id = new Store().getNewRequestId();
    socket.send(
      JSON.stringify({
        method,
        params,
        jsonrpc: "2.0",
        id,
      })
    );

    listeners[id] = { method, callback, id };
  }

  return {
    registerListener,
    getSocket: function () {
      if (!socket) {
        setSocket();
      }
      return socket;
    },
    waitForOpen: function () {
      if (!socket) throw new Error("socket not initialized");
      return waitForOpenConnection(socket);
    },
  };
})();

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
    WebsocketFactory.getSocket()!;

    await WebsocketFactory.waitForOpen();

    WebsocketFactory.registerListener(method, params, callback);
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
