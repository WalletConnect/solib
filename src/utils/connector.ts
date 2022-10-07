import { Connector } from "../connectors/base";
import Store from "../store";

export async function withConnector<T>(
  withConnectorFunc: (connector: Connector) => Promise<T>
) {
  const connector = new Store().getActiveConnector();

  if (connector.isAvailable()) {
    return await withConnectorFunc(connector);
  }

  return null;
}
