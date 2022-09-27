import { SystemProgram, Transaction, PublicKey } from "@solana/web3.js";
import base58 from "bs58";
import Store from "../store";
import { BaseConnector, Connector, TransactionArgs } from "./base";

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
  protected getProvider() {
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

  public async signMessage(message: string) {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await this.request("signMessage", {
      message: encodedMessage,
      format: "utf8",
    });
    const { signature } = signedMessage;

    return { signature };
  }

  public async signAndSendTransaction({
    type,
    to,
    amountInLamports,
  }: TransactionArgs) {
    const fromAddress = new Store().getAddress();
    if (!fromAddress) throw new Error("No address in store");

    const fromBuffer: PublicKey = new PublicKey(fromAddress);

    const toBuffer: PublicKey = new PublicKey(to);

    const transaction = new Transaction();

    if (type === "transfer") {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: fromBuffer,
          toPubkey: toBuffer,
          lamports: amountInLamports,
        })
      );
    }

    transaction.feePayer = fromBuffer;

    let { value } = await this.requestCluster("getLatestBlockhash", [
      {} as any,
    ]);

    const { blockhash: recentBlockhash } = value;

    transaction.recentBlockhash = recentBlockhash;

    const signedTransaction = await this.getProvider()!.signTransaction(
      transaction
    );

    console.log({
      address: fromBuffer.toString(),
      toAddress: toBuffer.toString(),
      recentBlockhash,
      transaction,
      signedTransaction,
      serialized: signedTransaction.serialize(),
    });

    const transactionSignature = await this.requestCluster("sendTransaction", [
      base58.encode(signedTransaction.serialize()),
    ]);

    return { signature: transactionSignature };
  }

  public async getBalance(requestedAddress?: string) {
    const address = requestedAddress ?? new Store().getAddress();
    if (!address) return null;

    const balance = await this.requestCluster("getBalance", [address]);

    return balance.value;
  }
}
