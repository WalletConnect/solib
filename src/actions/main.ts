import { Connector, TransactionType } from "../connectors/base";
import Store, { StoreConfig } from "../store";
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

export async function signAndSendTransaction(
  to: string,
  amountInLamports: number,
  type: TransactionType = "transfer"
) {
  return withConnector(async (connector) => {
    return await connector.signAndSendTransaction({
      type,
      amountInLamports,
      to,
    });
  });
}
