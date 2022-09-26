import Store, { StoreConfig } from "../store";

export function init(config: StoreConfig) {
  new Store(config);
}

export async function connect() {
  const store = new Store();

  const connector = store.getConnectors()[0];

  if (connector.isAvailable()) {
    return await connector.connect();
  } else {
    return null;
  }
}
