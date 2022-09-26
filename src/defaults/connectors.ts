import { PhantomConnector } from "../connectors/phantom";

export function getDefaultConnectors() {
  return [new PhantomConnector()];
}
