import type { TransactionArgs, TransactionType } from '../types/requests'
import { withConnector } from '../utils/connector'

export async function signTransaction<Type extends TransactionType>(
  type: Type,
  transactionArgs: TransactionArgs[Type]['params']
) {
  return withConnector(async connector => {
    return connector.signTransaction(type, transactionArgs)
  })
}

export async function sendTransaction(encodedTransaction: string) {
  return withConnector(async connector => {
    return connector.sendTransaction(encodedTransaction)
  })
}

export async function getTransaction(encodedTransaction: string) {
  return withConnector(async connector => {
    return connector.getTransaction(encodedTransaction)
  })
}

export async function signAndSendTransaction<Type extends TransactionType>(
  type: Type,
  transactionArgs: TransactionArgs[Type]['params']
) {
  return withConnector(async connector => {
    return connector.signAndSendTransaction(type, transactionArgs)
  })
}

export async function watchTransaction(
  transactionSignature: string,
  callback: (params: unknown) => void
) {
  return withConnector(async connector => {
    return connector.watchTransaction(transactionSignature, callback)
  })
}

export async function getFeeForMessage<Type extends TransactionType>(
  type: Type,
  transactionArgs: TransactionArgs[Type]['params']
) {
  return withConnector(async connector => {
    return connector.getFeeForMessage(type, transactionArgs)
  })
}

export async function getBlock(blockSlot: number) {
  return withConnector(async connector => {
    return connector.getBlock(blockSlot)
  })
}
