import { proxy } from "valtio";
import { Connector } from "../connectors/base";
import { ClusterName } from "../defaults/clusters";

export interface StoreConfig {
  connectors: Connector[];
  chosenCluster: ClusterName;
}

interface State {
  connectors: Connector[];
  chosenCluster: ClusterName;
  address?: string;
}

class Store {
  private static _store: State;
  constructor(config?: StoreConfig) {
    if (!Store._store) {
      Store._store = proxy(config);
    }
  }

  private set<K extends keyof State>(key: K, value: State[K]) {
    Store._store[key] = value;
  }

  private get<K extends keyof State>(key: K): State[K] {
    return Store._store[key];
  }

  public setAddress(address: string) {
    this.set("address", address);
  }

  public getAddress() {
    return this.get("address");
  }

  public setCluster(cluster: ClusterName) {
    this.set("chosenCluster", cluster);
  }

  public getCluster() {
    return this.get("chosenCluster");
  }

  public getConnectors() {
    return [...Store._store.connectors];
  }
}

export default Store;
