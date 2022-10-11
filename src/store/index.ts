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

interface State {
  connectors: Connector[]
  connectorName: string
  chosenCluster: Cluster
  requestId: number
  socket?: WebSocket
  address?: string
}

const store: State = proxy({
  connectors: [],
  chosenCluster: {
    name: '',
    id: '',
    endpoint: ''
  },
  requestId: 0,
  connectorName: ''
})

function set<K extends keyof State>(key: K, value: State[K]) {
  store[key] = value
}

function get<K extends keyof State>(key: K): State[K] {
  return store[key]
}

export function getNewRequestId() {
  const curId = store.requestId
  store.requestId = curId + 1

  return store.requestId
}

export function setAddress(address: string) {
  set('address', address)
}

export function getAddress() {
  return get('address')
}

export function setConnectorName(connectorId: string) {
  const connectorNames = store.connectors.map(connector => connector.getConnectorName())
  if (connectorNames.some(connectorName => connectorName === connectorId))
    set('connectorName', connectorId)
  else
    throw new Error(`No connector with name ${connectorId} exists,
     available options are: ${connectorNames.join(',')} `)
}

export function getConnecterId() {
  return get('connectorName')
}

export function getActiveConnector() {
  const { connectors } = store
  const id = store.connectorName

  const activeConnector = connectors.find(connector => connector.getConnectorName() === id)

  if (!activeConnector) throw new Error('Invalid connector id configured')

  return activeConnector
}

export function setCluster(cluster: Cluster) {
  set('chosenCluster', cluster)
}

export function watchAddress(callback: (address?: string) => void) {
  const unsub = subscribe(store, ops => {
    const addressChangeOp = ops.find(op => op[1].includes('address'))

    if (addressChangeOp) callback(store.address)
  })

  return unsub
}

export function getCluster() {
  return get('chosenCluster')
}

export function getSocket() {
  return get('socket')
}

export function setSocket(socket: WebSocket) {
  set('socket', socket)
}

export function getConnectors() {
  return [...store.connectors]
}

export function initStore(config: StoreConfig) {
  Object.entries(config).forEach(([key, value]) => {
    set(key as keyof State, value)
  })

  setConnectorName(config.connectorName)
}
