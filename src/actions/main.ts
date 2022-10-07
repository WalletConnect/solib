import Store, { StoreConfig } from "../store";
import { polyfill } from "../utils/buffer";
import { withConnector } from "../utils/connector";

export function init(config: StoreConfig) {
  polyfill();
  new Store(config);
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

export async function watchAddress(callback: (address?: string) => void) {
  return new Store().watchAddress(callback);
}
