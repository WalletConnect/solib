export { init, switchConnector, getProjectId, setProjectId, getConnectorIsAvailable } from './main'
export {
  connect,
  disconnect,
  getAddress,
  getBalance,
  signMessage,
  switchNetwork,
  getNetwork,
  watchNetwork,
  watchAddress
} from './accounts'

export {
  signAndSendTransaction,
  signTransaction,
  sendTransaction,
  watchTransaction,
  getTransaction,
  getFeeForMessage
} from './transactions'

export { fetchName, getSolDomainsFromPublicKey } from './nameService'
