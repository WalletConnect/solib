import type { StoreConfig } from '../store'
import { initStore, getAddress as storeGetAddress } from '../store'
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
  watchAddress(callback)
}
