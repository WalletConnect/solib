import { Transaction } from "@solana/web3.js";
import base58 from "bs58";
import Store from "../store";
import { TransactionArgs, TransactionType } from "../types/requests";
import { BaseConnector, Connector } from "./base";

export interface PhantomPublicKey {
  length: number;
  negative: number;
  words: Uint8Array;
  toString: () => string;
}

declare global {
  interface Window {
    phantom?: {
      solana: {
        connect: () => Promise<{ publicKey: PhantomPublicKey }>;
        disconnect: () => Promise<void>;
        request: (params: any) => any;
        signTransaction: (transaction: Transaction) => Promise<{
          serialize: () => Uint8Array;
        }>;
        signMessage: (
          message: Uint8Array,
          format: string
        ) => Promise<{ signature: Uint8Array }>;
      };
    };
  }
}
export class PhantomConnector extends BaseConnector implements Connector {
  public static get connectorName() {
    return "phantom";
  }

  public geConnectortName(): string {
    return PhantomConnector.connectorName;
  }
  protected getProvider() {
    if (typeof window !== "undefined" && window.phantom) {
      return Promise.resolve(window.phantom.solana);
    }
    throw new Error("No Phantom provider found");
  }

  public isAvailable(): boolean {
    return !!this.getProvider();
  }

  public async connect() {
    const resp = await (await this.getProvider()).connect();
    Store.setAddress(resp.publicKey.toString());

    return resp.publicKey.toString();
  }

  public async signMessage(message: string) {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await this.request("signMessage", {
      message: encodedMessage,
      format: "utf8",
    });
    const { signature } = signedMessage;

    return { signature };
  }

  public async signTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) {
    const transaction = await this.constructTransaction(type, params);

    const signedTransaction = await (
      await this.getProvider()
    ).signTransaction(transaction);

    return base58.encode(signedTransaction.serialize());
  }

  public async signAndSendTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) {
    return await this.sendTransaction(await this.signTransaction(type, params));
  }
}
