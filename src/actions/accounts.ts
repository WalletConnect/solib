import type { Cluster } from '../types/cluster'
import {
  getAddress as storeGetAddress,
  setCluster,
  watchAddress as storeWatchAddress
} from '../store'
import { withConnector } from '../utils/connector'

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

export async function getAccount(requestedAddress?: string) {
  return withConnector(async connector => {
    return connector.getAccount(requestedAddress, 'jsonParsed')
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
