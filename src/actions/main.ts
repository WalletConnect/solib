import Store, { StoreConfig } from "../store";

export function init(config: StoreConfig) {
  new Store(config);
}

function getDefaultConnector() {
  const store = new Store();
  const connector = store.getConnectors()[0];
  return connector;
}

export async function connect() {
  const connector = getDefaultConnector();

  if (connector.isAvailable()) {
    return await connector.connect();
  }

  return null;
}

export async function signMessage(message: string) {
  const connector = getDefaultConnector();

  if (connector.isAvailable()) {
    return await connector.signMessage(message);
  }

  return null;
}
