import { Connector } from "../connectors/base";
import Store, { StoreConfig } from "../store";
import { TransactionArgs, TransactionType } from "../types/requests";
import { polyfill } from "../utils/buffer";

export function init(config: StoreConfig) {
  polyfill();
  new Store(config);
}

function getDefaultConnector() {
  const store = new Store();
  const connector = store.getConnectors()[0];
  return connector;
}

async function withConnector<T>(
  withConnectorFunc: (connector: Connector) => Promise<T>
) {
  const connector = getDefaultConnector();

  if (connector.isAvailable()) {
    return await withConnectorFunc(connector);
  }

  return null;
}

export async function connect() {
  return withConnector(async (connector) => {
    return await connector.connect();
  });
}

export async function signMessage(message: string) {
  return withConnector(async (connector) => {
    return await connector.signMessage(message);
  });
}

export async function getBalance(requestedAddress?: string) {
  return withConnector(async (connector) => {
    return await connector.getBalance(requestedAddress);
  });
}

export async function getAddress() {
  return new Store().getAddress();
}

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
