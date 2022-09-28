export interface ClusterSubscribeRequestMethods {
  signatureSubscribe: {
    params: Array<string>;
    returns: any;
  };
  signatureUnsubscribe: {
    params: Array<number>;
    returns: any;
  };
}
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

  getAccountInfo: {
    params: [string, { commitment?: string }];
    returns: any;
  };

  getProgramAccounts: {
    params: [string, { commitment?: string, filters?: Array<any>, encoding?: string }];
    returns: any;
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
