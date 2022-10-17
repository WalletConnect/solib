import type { StoreConfig } from '../store'
import { setConnectorName } from '../store'
import { initStore } from '../store'

export function init(config: StoreConfig) {
  initStore(config)
}

export function switchConnector(connectorName: string) {
  setConnectorName(connectorName)
}
