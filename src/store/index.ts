import { proxy } from "valtio";
import { BaseConnector } from "../connectors/base";

export interface StoreConfig {
  connectors: BaseConnector[];
}

interface State {
  connectors: BaseConnector[];
}

class Store {
  private static _store: State;
  constructor(config?: StoreConfig) {
    if (!Store._store) {
      Store._store = proxy(config);
    }
  }

  getConnectors() {
    return [...Store._store.connectors];
  }
}

export default Store;
