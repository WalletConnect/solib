import type { Connector } from '../connectors/base'
import Store from '../store'

export async function withConnector<T>(withConnectorFunc: (connector: Connector) => Promise<T>) {
  const connector = Store.getActiveConnector()

  if (connector.isAvailable()) 
    return withConnectorFunc(connector)
  

  return null
}
