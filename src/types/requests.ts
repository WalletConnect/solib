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
    params: [{ commitment?: string }];
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

export type TransactionArgs = {
  transfer: {
    to: string;
    amountInLamports: number;
    feePayer: "to" | "from";
  };
};
export type TransactionType = keyof TransactionArgs;
