import type { StoreConfig } from '../store'
import { setProjectId } from '../store'
import { setConnectorName } from '../store'
import { initStore } from '../store'

/**
 * @param {() => StoreConfig} config Builder to produce configuration
 * @param {string} walletConnectProjectId WalletConnect Project ID.This will be used for WalletConnect services like `WalletConnectConnector`
 */
export function init(config: () => StoreConfig, walletConnectProjectId?: string) {
  if (walletConnectProjectId) setProjectId(walletConnectProjectId)
  initStore(config())
}

export function switchConnector(connectorName: string) {
  setConnectorName(connectorName)
}
