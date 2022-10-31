# Solib Actions

The actions documented here boil down to Solib state management. 

## Init
Init functions should be called only once and it sets the state and maintains
connectors. Connectors can only be defined here.

```ts
import { 
  init, PhantomConnector, WalletConnectConnector, 
  InjectedConnector, mainnetBetaWalletConnect
} from '@walletconnect/solib'

init({
  // The different connector methodologies that will be used.
  // PhantomConnector will interact with injected Phantom Wallet using browser
  // extension, while WalletConnectConnector can be used to interact with all
  // wallets that support the WalletConnect protocol.
  connectors: [
    new PhantomConnector(),
    new InjectedConnector('window.solib'),
    new InjectedConnector('window.solflare'),
    new WalletConnectConnector({
      relayerRegion: 'wss://relay.walletconnect.com',
      metadata: {
        description: 'Test app for solib',
        name: 'Test Solib dApp',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
        url: 'http://localhost:3000'
      },
      autoconnect: true,
      qrcode: true
    })
  ],
  // Name of the connector to be used.
  // The connector needs to be registered in the connectors field above.
  // This can be switched later using `switchConnector` function.
  connectorName: WalletConnectConnector.connectorName,
  // The name of the cluster and network to use.
  // Here, `mainnetBeta` refers to the mainnetBeta Solana network, while
  // `WalletConnect` is the RPC server thhat will be used to do the communication
  chosenCluster: mainnetBetaWalletConnect(PROJECT_ID)
}, PROJECT_ID)
```

## State management

### Switch Connector
`switchConnector` will determine the connector used to perform `connect`,
`disconnect`, `signMessage` and most actions that do not communicate with a
cluster. This effectively manipulates `connectorName` configured in `init`.

```ts
import { switchConnector, PhantomConnector } from '@walletconnect/solib'

// After this, all function calls will use PhantomConnector under the hood.
switchConnector(PhantomConnector.connectorName())
```

### Switch Network
`switchNetwork` determines which cluster will be communicated with. This
effectively manipulates `chosenCluster`.

```ts
import { switchConnector, mainnetBetaWalletConnect, mainnetBetaProjectSerum } from '@walletconnect/solib'

// After this, all function calls will use PhantomConnector under the hood.
// `mainnetBetaWalletConnect` is a function call as it needs to retrieve 
// the configured PROJECT_ID.
switchNetwork(mainnetBetaWalletConnect()) 

switchNetwork(mainnetBetaProjectSerum)
```

### Set and Get project Id
The functions here are conceded with manipulating `PROJECT_ID` (the second
argument in `init`.

```ts
import { getProjectId, setProjectId } from '@walletconnect/solib'

setProjectId('0x8s...')

const projectId = getProjectId() 

console.log(projectId) // 0x8s...
```

### Get Connector is available
`getConnectorIsAvailable` determines whether a specified connector is available.

```ts
import { getConnectorIsAvailable, PhantomConnector } from '@walletconnect/solib'

const phantomIsAvailable1 = getConnectorIsAvailable(PhantomConnector.connectorName())

// OR

const phantomIsAvailable2 = getConnectorIsAvailable('injected-window.phantom.solana')

