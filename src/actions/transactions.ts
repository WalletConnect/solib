import { TransactionArgs, TransactionType } from "../types/requests";
import { withConnector } from "../utils/connector";

export async function signTransaction<Type extends TransactionType>(
  type: Type,
  transactionArgs: TransactionArgs[Type]
) {
  return withConnector(async (connector) => {
    return await connector.signTransaction(type, transactionArgs);
  });
}

export async function sendTransaction(encodedTransaction: string) {
  return withConnector(async (connector) => {
    return await connector.sendTransaction(encodedTransaction);
  });
}

export async function signAndSendTransaction<Type extends TransactionType>(
  type: Type,
  transactionArgs: TransactionArgs[Type]
) {
  return withConnector(async (connector) => {
    return await connector.signAndSendTransaction(type, transactionArgs);
  });
}

export async function watchTransaction(
  transactionSignature: string,
  callback: (params: any) => void
) {
  return withConnector(async (connector) => {
    return await connector.watchTransaction(transactionSignature, callback);
  });
}
