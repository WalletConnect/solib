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
  walletConnectProjectId: string
  socket?: WebSocket
  address?: string
}

const store: State = proxy<State>({
  connectors: [],
  chosenCluster: {
    name: '',
    id: '',
    endpoint: ''
  },
  walletConnectProjectId: '',
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

function getConnector(name: string) {
  const { connectors } = store
  const connector = connectors.find(connector => connector.getConnectorName() === name)

  if (!connector) throw new Error('Invalid connector id configured')

  return connector
}

export function getActiveConnector() {
  const id = store.connectorName

  return getConnector(id)
}

export function getConnectorIsAvailable(name: string) {
  const connector = getConnector(name)

  return connector.isAvailable()
}

export function setCluster(cluster: Cluster) {
  set('chosenCluster', cluster)
}

export function watchCluster(callback: (clusterName: Cluster) => void) {
  console.log('Subscribing to cluster')
  const unsub = subscribe(store, ops => {
    const clusterChangedOp = ops.find(op => op[1].includes('chosenCluster'))

    // Making a copy to avoid sending the proxy object
    const { id, name, endpoint } = store.chosenCluster
    if (clusterChangedOp)
      callback({
        id,
        name,
        endpoint
      })
  })

  return unsub
}

export function watchAddress(callback: (address?: string) => void) {
  console.log('Subscribing to address')
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

export function setProjectId(projectId: string) {
  set('walletConnectProjectId', projectId)
}

export function getProjectId() {
  return get('walletConnectProjectId')
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
