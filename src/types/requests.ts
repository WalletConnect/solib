import type { Transaction } from '@solana/web3.js'
import type { TransactionResult } from './transaction'

export interface AccountInfo {
  data: string[]
  executable: boolean
  lamports: number
  owner: string
  rentEpoch: number
}

export type FilterObject =
  | {
      memcmp: {
        offset: number
        bytes: string
        encoding?: string
      }
    }
  | { dataSize: number }

export interface ClusterSubscribeRequestMethods {
  signatureSubscribe: {
    params: string[]
    returns: Transaction
  }
  signatureUnsubscribe: {
    params: number[]
    returns: unknown
  }
}
export interface ClusterRequestMethods {
  sendTransaction: {
    // Signed, serialized transaction
    params: string[]
    returns: string
  }

  getFeeForMessage: {
    params: [string]
    returns: number
  }

  getBalance: {
    params: string[]
    returns: {
      value: number
    }
  }

  getProgramAccounts: {
    params: [string, FilterObject[]]
    returns: {
      value: AccountInfo[]
    }
  }

  getAccountInfo: {
    params: [string, { encoding: 'base58' | 'base64' | 'jsonParsed' }] | [string]
    returns?: {
      value: AccountInfo | null
    }
  }

  getTransaction: {
    params: [
      string,
      { encoding: 'base58' | 'base64' | 'jsonParsed'; commitment: 'confirmed' | 'finalized' }
    ]
    returns: TransactionResult | null
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

export interface TransactionInstructionRq {
  programId: string
  data: string
  keys: { isSigner: boolean; isWritable: boolean; pubkey: string }[]
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
      instructions: TransactionInstructionRq[]
      recentBlockhash: string
      signatures?: { pubkey: string; signature: string }[]
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
    } | null
  }

  signTransaction: {
    params: {
      // Serialized transaction
      message: string
    }
    returns: {
      serialize: () => string
    } | null
  }
}

export interface TransactionArgs {
  transfer: {
    params: {
      to: string
      amountInLamports: number
      feePayer: 'from' | 'to'
    }
  }
  program: {
    params: {
      programId: string
      isWritableSender: boolean
      data: Record<string, unknown>
    }
  }
}
export type TransactionType = keyof TransactionArgs
