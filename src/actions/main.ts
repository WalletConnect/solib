import { setCluster, setConnectorName, StoreConfig } from '../store'
import {
  initStore,
  getAddress as storeGetAddress,
  watchAddress as storeWatchAddress
} from '../store'
import { Cluster } from '../types/cluster'
import { withConnector } from '../utils/connector'

export function init(config: StoreConfig) {
  initStore(config)
}

export async function connect() {
  return withConnector(async connector => {
    return connector.connect()
  })
}

export async function signMessage(message: string) {
  return withConnector(async connector => {
    return connector.signMessage(message)
  })
}

export async function getBalance(requestedAddress?: string) {
  return withConnector(async connector => {
    return connector.getBalance(requestedAddress)
  })
}

export function getAddress() {
  return storeGetAddress()
}

export function watchAddress(callback: (address?: string) => void) {
  storeWatchAddress(callback)
}

export function switchNetwork(cluster: Cluster) {
  setCluster(cluster)
}

export function switchConnector(connectorName: string) {
  setConnectorName(connectorName)
}
