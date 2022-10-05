import { proxy } from "valtio/vanilla";
import { Connector } from "../connectors/base";
import { ClusterName } from "../defaults/clusters";

export interface StoreConfig {
  connectors: Connector[];
  chosenCluster: ClusterName;
}

interface State {
  connectors: Connector[];
  chosenCluster: ClusterName;
  requestId: number;
  socket?: WebSocket;
  address?: string;
}

class Store {
  private static _store: State;
  constructor(config?: StoreConfig) {
    if (!Store._store && config) {
      Store._store = proxy({ ...config, requestId: 0 });
    }
  }

  private set<K extends keyof State>(key: K, value: State[K]) {
    Store._store[key] = value;
  }

  private get<K extends keyof State>(key: K): State[K] {
    return Store._store[key];
  }

  public getNewRequestId() {
    const curId = Store._store["requestId"];
    Store._store["requestId"] = curId + 1;
    return Store._store["requestId"];
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

  public getSocket() {
    return this.get("socket");
  }

  public setSocket(socket: WebSocket) {
    return this.set("socket", socket);
  }

  public getConnectors() {
    return [...Store._store.connectors];
  }
}

export default Store;
