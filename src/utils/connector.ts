import type { Connector } from '../connectors/base'
import { getActiveConnector } from '../store'

export async function withConnector<T>(withConnectorFunc: (connector: Connector) => Promise<T>) {
  const connector = getActiveConnector()

  if (connector.isAvailable()) return withConnectorFunc(connector)

  return null
}
