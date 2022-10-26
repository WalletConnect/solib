import type { TransactionInstruction } from './transaction'

export interface BlockResult {
  blockHeight: number
  blockTime: null
  blockhash: string
  parentSlot: number
  previousBlockhash: string
  transactions: TransactionElement[]
}

export interface TransactionElement {
  meta: Meta
  transaction: TransactionTransaction
}

export interface Meta {
  err: null
  fee: number
  innerInstructions: TransactionInstruction[]
  logMessages: string[]
  postBalances: number[]
  postTokenBalances: number[]
  preBalances: number[]
  preTokenBalances: number[]
  rewards: null
  status: Status
}

export interface Status {
  Ok: null
}

export interface TransactionTransaction {
  message: Message
  signatures: string[]
}

export interface Message {
  accountKeys: string[]
  header: Header
  instructions: Instruction[]
  recentBlockhash: string
}

export interface Header {
  numReadonlySignedAccounts: number
  numReadonlyUnsignedAccounts: number
  numRequiredSignatures: number
}

export interface Instruction {
  accounts: number[]
  data: string
  programIdIndex: number
}
