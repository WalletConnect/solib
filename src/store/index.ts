import { proxy, subscribe } from 'valtio/vanilla'
import type { Connector } from '../connectors/base'
import type { Cluster } from '../types/cluster'

export interface StoreConfig {
  /**
   * List of connectors to be supported. a specific connector is chosen using
   * `connectorName`. Eg: `[new PhantomConnector()]`
   */
  connectors: Connector[]
  /**
   *  Name of the chosen connector from the `connectors` supplied.
   *  Can be accessed by statically getting the connector name,
   *  E.g: `WalletConnectConnector.connectorName`
   */
  connectorName: string
  /**
   * Chosen cluster/network to communicate with. Options are exported. Eg:
   * `mainnetBetaWalletConnect` which will communicate with the Solana mainnet
   * using WalletConnect's RPC
   */
  chosenCluster: Cluster
}

/**
 */
interface State {
  connectors: Connector[]
  connectorName: string
  chosenCluster: Cluster
  requestId: number
  socket?: WebSocket
  address?: string
}

class Store {
  private static _store: State
  constructor(config?: StoreConfig) {
    if (!Store._store && config) {
      Store._store = proxy({ ...config, requestId: 0 })

      // Calling this to trigger the error checking.
      Store.setConnectorId(config.connectorName)
    }
  }

  private static set<K extends keyof State>(key: K, value: State[K]) {
    Store._store[key] = value
  }

  private static get<K extends keyof State>(key: K): State[K] {
    return Store._store[key]
  }

  public static getNewRequestId() {
    const curId = Store._store.requestId
    Store._store.requestId = curId + 1
    
return Store._store.requestId
  }

  public static setAddress(address: string) {
    Store.set('address', address)
  }

  public static getAddress() {
    return Store.get('address')
  }

  public static setConnectorId(connectorId: string) {
    const connectorNames = Store._store.connectors.map(connector => connector.getConnectorName())
    if (connectorNames.some(connectorName => connectorName === connectorId)) 
      Store.set('connectorName', connectorId)
     else
      throw new Error(`No connector with name ${connectorId} exists,
       available options are: ${connectorNames.join(',')} `)
  }

  public static getConnecterId() {
    return Store.get('connectorName')
  }

  public static getActiveConnector() {
    const {connectors} = Store._store
    const id = Store._store.connectorName

    const connector = connectors.find(connector => connector.getConnectorName() === id)

    if (!connector) 
      throw new Error('Invalid connector id configured')
    

    return connector
  }

  public static setCluster(cluster: Cluster) {
    Store.set('chosenCluster', cluster)
  }

  public static watchAddress(callback: (address?: string) => void) {
    const unsub = subscribe(Store._store, ops => {
      const addressChangeOp = ops.find(op => op[1].includes('address'))

      if (addressChangeOp) 
        callback(Store._store.address)
      
    })

    return unsub
  }

  public static getCluster() {
    return Store.get('chosenCluster')
  }

  public static getSocket() {
    return Store.get('socket')
  }

  public static setSocket(socket: WebSocket) {
    Store.set('socket', socket);
  }

  public static getConnectors() {
    return [...Store._store.connectors]
  }
}

export default Store
