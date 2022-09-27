import { Connector } from "../connectors/base";
import Store from "../store";

function getDefaultConnector() {
  const store = new Store();
  const connector = store.getConnectors()[0];
  return connector;
}

export async function withConnector<T>(
  withConnectorFunc: (connector: Connector) => Promise<T>
) {
  const connector = getDefaultConnector();

  if (connector.isAvailable()) {
    return await withConnectorFunc(connector);
  }

  return null;
}
