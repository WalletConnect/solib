import { proxy, subscribe } from "valtio/vanilla";
import { Connector } from "../connectors/base";
import { Cluster } from "../types/cluster";

export interface StoreConfig {
  connectors: Connector[];
  chosenCluster: Cluster;
  connectorId: string;
}

interface State {
  connectors: Connector[];
  connectorId: string;
  chosenCluster: Cluster;
  requestId: number;
  socket?: WebSocket;
  address?: string;
}

class Store {
  private static _store: State;
  constructor(config?: StoreConfig) {
    if (!Store._store && config) {
      Store._store = proxy({ ...config, requestId: 0 });

      // Calling this to trigger the error checking.
      this.setConnectorId(config.connectorId);
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

  public setConnectorId(connectorId: string) {
    const connectorNames = Store._store.connectors.map((connector) =>
      connector.getConnectorName()
    );
    if (connectorNames.some((connectorName) => connectorName === connectorId)) {
      this.set("connectorId", connectorId);
    } else
      throw new Error(`No connector with name ${connectorId} exists,
       available options are: ${connectorNames.join(",")} `);
  }

  public getConnecterId() {
    return this.get("connectorId");
  }

  public getActiveConnector() {
    const connectors = Store._store.connectors;
    const id = Store._store.connectorId;

    const connector = connectors.find(
      (connector) => connector.getConnectorName() === id
    );

    if (!connector) {
      throw new Error("Invalid connector id configured");
    }

    return connector;
  }

  public setCluster(cluster: Cluster) {
    this.set("chosenCluster", cluster);
  }

  public watchAddress(callback: (address?: string) => void) {
    const unsub = subscribe(Store._store, (ops) => {
      const addressChangeOp = ops.find((op) => op[1].includes("address"));

      if (addressChangeOp) {
        callback(Store._store.address);
      }
    });

    return unsub;
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
