export interface ClusterSubscribeRequestMethods {
  signatureSubscribe: {
    params: Array<string>
    returns: any
  }
  signatureUnsubscribe: {
    params: Array<number>
    returns: any
  }
}
export interface ClusterRequestMethods {
  sendTransaction: {
    // Signed, serialized transaction
    params: Array<string>
    returns: string
  }

  getBalance: {
    params: Array<string>
    returns: {
      value: number
    }
  }

  getLatestBlockhash: {
    params: [{ commitment?: string }]
    returns: {
      value: {
        blockhash: string
      }
    }
  }
}

export interface TransactionInstruction {
  programId: string
  data: any
  keys: Array<{ isSigner: boolean; isWritable: boolean; pubkey: string }>
}

export interface RequestMethods {
  solana_signMessage: {
    params: {
      message: string
      pubkey: string
    }
    returns: {
      signature: string
    }
  }
  solana_signTransaction: {
    params: {
      feePayer: string
      instructions: TransactionInstruction[]
      recentBlockhash: string
      signatures?: Array<{ pubkey: string; signature: string }>
    }
    returns: {
      signature: string
    }
  }
  signMessage: {
    params: {
      message: Uint8Array
      format: string
    }
    returns: {
      signature: string
    }
  }

  signTransaction: {
    params: {
      // Serialized transaction
      message: string
    }
    returns: {
      serialize: () => string
    }
  }
}

export type TransactionArgs = {
  transfer: {
    to: string
    amountInLamports: number
    feePayer: 'to' | 'from'
  }
}
export type TransactionType = keyof TransactionArgs
