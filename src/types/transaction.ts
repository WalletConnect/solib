export interface TransactionResult {
  meta: Meta
  slot: number
  transaction: Transaction
}

export interface Meta {
  err: null
  fee: number
  innerInstructions: TransactionInstruction[]
  postBalances: number[]
  postTokenBalances: number[]
  preBalances: number[]
  preTokenBalances: number[]
  rewards: number[]
}

export interface Transaction {
  message: Message
  signatures: string[]
}

export interface Message {
  accountKeys: string[]
  header: Header
  instructions: TransactionInstruction[]
  recentBlockhash: string
}

export interface Header {
  numReadonlySignedAccounts: number
  numReadonlyUnsignedAccounts: number
  numRequiredSignatures: number
}

export interface TransactionInstruction {
  accounts: number[]
  data: string
  programIdIndex: number
}
