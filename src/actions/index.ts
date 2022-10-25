export { init, switchConnector } from './main'
export {
  connect,
  getAddress,
  getBalance,
  signMessage,
  switchNetwork,
  watchAddress
} from './accounts'

export {
  signAndSendTransaction,
  signTransaction,
  sendTransaction,
  watchTransaction,
  getTransaction
} from './transactions'

export { fetchName, getSolDomainsFromPublicKey } from './nameService'
