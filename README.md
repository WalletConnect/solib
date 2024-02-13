# Solib

> [!CAUTION]
> Effective as of February 13th, 2024, Solib has been deprecated.
>
> If your project is impacted by this change, please open an issue on [Github Discussions](https://github.com/orgs/WalletConnect/discussions) to address any concerns or seek assistance.

**Solana** friendly API

Checkout [the complete docs](https://solib-docs.vercel.app)!

# Current Capabilities

## API

- Connect Wallet:
  - Phantom
  - WalletConnect
- Get balance
- Sign Transaction
- Send Transaction
- Sign and send Transaction
- Sign Message
- Watch Transactions

### Init

The init function needs to be called to prepare `solib` to be able to call all
the functions in its API.

```ts
import { init } from 'solib'

init(
  {
    // The different connector methodologies that will be used.
    // PhantomConnector will interact with injected Phantom Wallet using browser
    // extension, while WalletConnectConnector can be used to interact with all
    // wallets that support the WalletConnect protocol.
    connectors: [
      new PhantomConnector(),
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
    chosenCluster: mainnetBetaWalletConnect()
  },
  WALLETCONNECT_PROJECT_ID
)
```

### Connect Wallet

The connect function can be used to connect a wallet to a dApp. The wallet
chosen needs to be configured in the `init` function above.

```ts
import { connect } from 'solib'

const address = await connect()
```

### Watch Address

Instead of retrieving the address once on the connect function, one can globally
watch address changes using the `watchAddress` API.

```ts
import { watchAddress, connect } from 'solib'

watchAddress(address => {
  console.log({ address })
})

connect()
```

### Get Balance

```ts
import { getBalance } from 'solib'

const connectedWalletBalance: number = await getBalance()
```

### Sign Message

```ts
import { signMessage } from 'solib'

const signature = await signMessage('Test')
```

### Sign and Send Transaction

```ts
import { signAndSendTransaction } from 'solib'

const transactionHash = signAndSendTransaction('transfer', {
  to,
  amountInLamports,
  feePayer: 'from'
})
```

### Watch Transaction

```ts
import { signAndSendTransaction, watchTransaction } from 'solib'

const transactionHash = signAndSendTransaction('transfer', {
  to,
  amountInLamports,
  feePayer: 'from'
})

watchTransaction(transactionHash, update => console.log({ update }))
```

### Switch network

```ts
import { switchNetwork, mainnetBetaProjectSerum } from 'solib'

switchNetwork(mainnetBetaProjectSerum)
```

### Switch Connector

```ts
import { switchConnector, PhantomConnector, connect } from 'solib'

switchConnector(PhantomConnector.connectorName)

const phantonWalletAddress = await connect()
```

## Internals

- Generic transaction construction
- Using cluster `sendTransaction` to avoid depending on aa wallet's
  implementation, only having to use their `signMessage` function
- Internal store maintaining state
- Base connector to help with making future connectors (Eg: WalletConnect
  connector)
- Generic typing
- From scratch cluster websocket factory so we can listen to events and attach
  custom listeners in the future, in a generic manner.
- Unsub functionality

# Development

For now when developing, feel free to use the `example/dev.sh` to help with
refreshing the cache and installing a fresh local `solib` package to test your
changes. TODO: Will look into making this better.

# Folders

## Example

Example app written in react, for testing

## Src

Actual source code.

- actions: This where most of the developer public will live. Actions are what
  developers will use to fetch and manipulate data on the solana blockchain
- connectors: This is where connectors will live. Connectors are basically
  adapters using wallet providers (Eg: Phantom). `base.ts` is a base class that
  has functionality for building connectors, as well as non-wallet-specific
  actions (eg: fetching wallet balance from the cluster)
- defaults: This is where default things will live, like the clusters we have
  configured
- store: A rudimentary store used for storing address, chosen cluster, etc
- types: Self explanatory. Not _all_ types need to live here, however.
- utils: Self explanatory.

# Resources:

- [Web3Solana API Introduction](https://docs.solana.com/developing/clients/javascript-api)
- [Solana JSONRPC API](https://docs.solana.com/developing/clients/jsonrpc-api)
- [Solana Faucet for dev](https://solfaucet.com/)
- [Phantom Docs](https://docs.phantom.app/integrating/extension-and-in-app-browser-web-apps/establishing-a-connection)
- [solana/web3 API](https://solana-labs.github.io/solana-web3.js/modules.html)
